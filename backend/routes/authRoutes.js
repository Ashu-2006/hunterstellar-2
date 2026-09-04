const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const teamModel = require("../db/teamModel");
const { getTeamStateForUser } = require("../utils/teamState");
const { loginLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.post("/login", loginLimiter, async (req, res) => {
  const { team_name, password } = req.body;

  if (!team_name || !password) {
    return res.status(400).json({ error: "team_name and password required" });
  }

  const { data, error } = await teamModel.getByTeamName(team_name);
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Team not found" });

  const match = await bcrypt.compare(password, data.password);
  if (!match) return res.status(401).json({ error: "Invalid password" });

  const state = await getTeamStateForUser(data.id);
  if (state.error) return res.status(state.status).json({ error: state.message });

  // One active session per team: this login supersedes whatever device was
  // signed in before. Written BEFORE the token is issued -- if the update
  // fails we would rather 500 than hand out a token that gets refused on the
  // team's first submit, halfway across the event.
  const sid = crypto.randomUUID();
  const { error: sessionError } = await teamModel.update(data.id, {
    session_token: sid,
  });
  if (sessionError) {
    return res.status(500).json({ error: "Could not start session" });
  }

  const token = jwt.sign({ userId: data.id, sid }, process.env.JWT_SECRET, {
    expiresIn: "3h",
  });

  return res.json({
    user: state.team,
    token,
  });
});

module.exports = router;
