const supabase = require("../db/supabaseClient");

async function requireEventActive(req, res, next) {
  const { data: config, error } = await supabase
    .from("event_config")
    .select("started_at, duration_minutes, ended_at")
    .eq("id", 1)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  const now = Date.now();
  const startedAt = config?.started_at ? new Date(config.started_at).getTime() : null;
  const endedAt = config?.ended_at ? new Date(config.ended_at).getTime() : null;

  if (!startedAt || startedAt > now) {
    return res.status(403).json({ error: "Event has not started" });
  }

  const durationEnd = config?.duration_minutes
    ? startedAt + config.duration_minutes * 60 * 1000
    : null;
  const effectiveEnd = endedAt && durationEnd
    ? Math.min(endedAt, durationEnd)
    : endedAt || durationEnd;

  if (effectiveEnd && effectiveEnd <= now) {
    return res.status(403).json({ error: "Event has ended" });
  }

  next();
}

module.exports = { requireEventActive };
