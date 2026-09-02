const express = require("express");
const bcrypt = require("bcryptjs");
const supabase = require("../db/supabaseClient");
const teamModel = require("../db/teamModel");
const { requireAuth } = require("../middleware/auth");
const { requireEventActive } = require("../middleware/eventStatus");
const { verifyLimiter } = require("../middleware/rateLimit");
const { getTeamStateForUser, invalidateTeamStateCache, buildRandomRoute } = require("../utils/teamState");
const { sendWelcomeEmail } = require("../utils/email");

const router = express.Router();

router.post("/team/register", async (req, res) => {
  if (req.headers["x-webhook-secret"] !== process.env.WEBHOOK_SECRET) {
    return res.sendStatus(403);
  }

  const { team_name : requested_name, team_leader, members, password, email } = req.body;
  let team_name = requested_name;
  if (!team_name || !password || !email) {
    return res.status(400).json({
      error: "team_name, password, and email are required",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let route;
  try {
    route = await buildRandomRoute();
  } catch {
    return res.status(500).json({ error: "Could not build team route" });
  }
  const existing = await teamModel.getByTeamName(team_name);
  if (existing.error)
    return res.status(500).json({ error: existing.error.message });
  if (existing.data) {
    for (let i = 0; i < 5; i++) {
       const candidate = `${team_name}_${Math.floor(Math.random() * 9000 + 1000)}`;
      const check = await teamModel.getByTeamName(candidate);
      if (check.error)
        return res.status(500).json({ error: check.error.message });
      if (!check.data) {
        team_name = candidate;
        break;
      }
    }
  }
  const { error: insertError } = await supabase.from("teams").insert({
    team_name,
    team_leader,
    members,
    password: hashedPassword,
    route,
    email,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return res.status(409).json({ error: "team_name already exists" });
    }
    return res.status(500).json({ error: insertError.message });
  }

  sendWelcomeEmail({ to: email, team_name, password, email });

  res.sendStatus(200);
});

router.post(
  "/team/verify-code",
  requireAuth,
  requireEventActive,
  verifyLimiter,
  async (req, res) => {
    const { enteredCode } = req.body;
    const teamId = req.userId;

    if (typeof enteredCode !== "string" || !enteredCode.trim()) {
      return res.status(400).json({ error: "enteredCode required" });
    }

    const { data: team } = await teamModel.getById(teamId);
    if (!team || !team.route?.[team.progress]) {
      return res.status(404).json({ message: "team doesn't exist" });
    }
    const currentStop = team.route[team.progress];

    if (team.status === "locked" && new Date(team.lock_until) > new Date()) {
      return res.json({
        success: false,
        reason: "locked",
        lock_until: team.lock_until,
      });
    }

    if (team.stage !== "awaiting_code") {
      const state = await getTeamStateForUser(teamId);
      return res.json({ success: false, reason: "wrong_stage", state });
    }

    const { data: island } = await supabase
      .from("islands")
      .select("correct_code, id")
      .eq("id", currentStop.island_id)
      .single();

    if (!island) {
      return res.status(500).json({ error: "Could not fetch island" });
    }

    if (
      enteredCode.trim().toLowerCase() ===
      island.correct_code.trim().toLowerCase()
    ) {
      const isLastStop = currentStop.question_id === null;
      const newProgress = isLastStop ? team.progress + 1 : team.progress;

      await supabase
        .from("teams")
        .update({
          stage: isLastStop ? "awaiting_code" : "awaiting_puzzle",
          progress: newProgress,
          status: isLastStop ? "finished" : team.status,
        })
        .eq("id", teamId);

      invalidateTeamStateCache(teamId);
      const state = await getTeamStateForUser(teamId);
      return res.json({ success: true, state });
    }

    const lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    await supabase
      .from("teams")
      .update({
        status: "locked",
        lock_until: lockUntil,
        wrong_attempts: team.wrong_attempts + 1,
      })
      .eq("id", teamId);
    invalidateTeamStateCache(teamId);

    return res.json({
      success: false,
      reason: "wrong_code",
      lock_until: lockUntil,
    });
  },
);

router.post(
  "/team/verify-answer",
  requireAuth,
  requireEventActive,
  verifyLimiter,
  async (req, res) => {
    const { enteredAns } = req.body;

    if (typeof enteredAns !== "string" || !enteredAns.trim()) {
      return res.status(400).json({ error: "enteredAns required" });
    }

    const { data: team } = await teamModel.getById(req.userId);
    if (!team || !team.route?.[team.progress]) {
      return res.status(404).json({ message: "team doesn't exist" });
    }
    const currentStop = team.route[team.progress];

    if (team.status === "locked" && new Date(team.lock_until) > new Date()) {
      return res.json({
        success: false,
        reason: "locked",
        lock_until: team.lock_until,
      });
    }

    if (team.stage !== "awaiting_puzzle") {
      const state = await getTeamStateForUser(req.userId);
      return res.json({ success: false, reason: "wrong_stage", state });
    }

    const { data: question } = await supabase
      .from("questions")
      .select("question_answer, id")
      .eq("id", currentStop.question_id)
      .single();

    if (!question) {
      return res.status(500).json({ error: "Could not fetch question" });
    }

    if (
      enteredAns.trim().toLowerCase() ===
      question.question_answer.trim().toLowerCase()
    ) {
      const newProgress = team.progress + 1;
      await supabase
        .from("teams")
        .update({
          stage: "awaiting_code",
          progress: newProgress,
          status: newProgress === 5 ? "finished" : team.status,
          last_correct_at: new Date().toISOString(),
        })
        .eq("id", req.userId);

      invalidateTeamStateCache(req.userId);
      const state = await getTeamStateForUser(team.id);
      return res.json({ success: true, state });
    }

    return res.json({ success: false });
  },
);

router.get("/team/state", requireAuth, async (req, res) => {
  const state = await getTeamStateForUser(req.userId);
  if (state.error) {
    return res.status(state.status).json({ error: state.message });
  }
  res.json(state);
});

module.exports = router;
