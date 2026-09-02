const supabase = require("../db/supabaseClient");
const teamModel = require("../db/teamModel");

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const STATE_CACHE = new Map();
const CACHE_TTL_MS = 1500;

function invalidateTeamStateCache(userId) {
  if (userId) STATE_CACHE.delete(String(userId));
}

function invalidateAllTeamStateCache() {
  STATE_CACHE.clear();
}

async function getTeamStateForUser(userId) {
  const cacheKey = String(userId);
  const now = Date.now();
  const cached = STATE_CACHE.get(cacheKey);
  if (cached && now - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  // Try single-round-trip RPC first (requires migration get_team_state)
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc("get_team_state", {
      p_user_id: userId,
    });

    if (!rpcError && rpcData) {
      // Supabase may return json string; normalize
      const data = typeof rpcData === "string" ? JSON.parse(rpcData) : rpcData;

      if (data && !data.error) {
        // Handle stale lock: if RPC still says locked but lock expired, fix row and retry once
        if (data.stage === "locked" && data.lock_until && new Date(data.lock_until) <= new Date()) {

          await supabase.from("teams").update({ status: "active", lock_until: null }).eq("id", userId);
          STATE_CACHE.delete(cacheKey);

          // One retry via RPC (avoid infinite loop)
          const retry = await supabase.rpc("get_team_state", { p_user_id: userId });
          if (!retry.error && retry.data) {
            const r = typeof retry.data === "string" ? JSON.parse(retry.data) : retry.data;
            STATE_CACHE.set(cacheKey, { data: r, ts: Date.now() });
            return r;
          }
          
        }
        // Handle team not found via RPC returning null
        if (data.team == null && data.stage == null) {
          // Fall through to sequential fallback which returns 404
        } else {
          STATE_CACHE.set(cacheKey, { data, ts: now });
          return data;
        }
      }
    }
  } catch (_) {
    // RPC not deployed yet — fall through to sequential path
  }

  // --- Sequential fallback (keeps behavior before RPC was deployed) ---
  const { data: team, error } = await teamModel.getById(userId);

  if (error || !team) {
    return { error: true, status: 404, message: "Team not found" };
  }

  const { data: latestAnnouncement } = await supabase
    .from("announcements")
    .select("message")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const announcement = latestAnnouncement?.message || null;

  const { password, route, ...safeTeam } = team;
  const currentStop = team.route?.[team.progress];
  const notice = team.notice || null;

  if (!currentStop || team.progress >= 5) {
    const result = {
      team: safeTeam,
      stage:
        team.status === "finished" || team.progress >= 5
          ? "finished"
          : team.stage || "ready",
      notice,
      announcement,
    };
    STATE_CACHE.set(cacheKey, { data: result, ts: now });
    return result;
  }

  let status = team.status;
 if (
    status === "locked" &&
    (!team.lock_until || new Date(team.lock_until) <= new Date())
  ) {
    const { error } = await supabase
      .from("teams")
      .update({ status: "active", lock_until: null })
      .eq("id", userId)
      .select("status")
      .single();

    if (!error) {
      status = "active";
    }
  }

  if (status === "locked") {
    const result = {
      team: safeTeam,
      stage: "locked",
      lock_until: team.lock_until,
      notice,
      announcement,
    };
    STATE_CACHE.set(cacheKey, { data: result, ts: now });
    return result;
  }

  if (team.stage === "awaiting_code") {
    const { data: island } = await supabase
      .from("islands")
      .select("clue_statement")
      .eq("id", currentStop.island_id)
      .single();

    const result = {
      team: safeTeam,
      stage: "awaiting_code",
      clue_statement: island?.clue_statement,
      notice,
      announcement,
    };
    STATE_CACHE.set(cacheKey, { data: result, ts: now });
    return result;
  }

  if (team.stage === "awaiting_puzzle") {
    const { data: question } = await supabase
      .from("questions")
      .select("question_statement")
      .eq("id", currentStop.question_id)
      .single();

    const result = {
      team: safeTeam,
      stage: "awaiting_puzzle",
      question: question?.question_statement,
      notice,
      announcement,
    };
    STATE_CACHE.set(cacheKey, { data: result, ts: now });
    return result;
  }

  const result = { team: safeTeam, stage: team.stage || "ready", notice, announcement };

  STATE_CACHE.set(cacheKey, { data: result, ts: now });
  return result;
}

async function buildRandomRoute() {
  const { data: allIslands } = await supabase
    .from("islands")
    .select("*");

  const groups = {};
  for (const island of allIslands) {
    const o = island.order;
    if (!groups[o]) groups[o] = [];
    groups[o].push(island);
  }

  const domains = shuffle(
    [...new Set(
      (await supabase.from("questions").select("domain")).data.map(
        (d) => d.domain,
      ),
    )]
  );

  const route = [];
  for (let o = 1; o <= 5; o++) {
    const selected = shuffle(groups[o] || [])[0];
    if (o === 5) {
      route.push({ island_id: selected.id, question_id: null });
    } else {
      const { data: questions } = await supabase
        .from("questions")
        .select("*")
        .eq("domain", domains[o - 1]);

      const question = questions[Math.floor(Math.random() * questions.length)];
      route.push({
        island_id: selected.id,
        question_id: question.id,
      });
    }
  }

  return route;
}

module.exports = {
  getTeamStateForUser,
  invalidateTeamStateCache,
  invalidateAllTeamStateCache,
  buildRandomRoute,
};
