const express = require("express");
const supabase = require("../db/supabaseClient");

const router = express.Router();

router.get("/event", async (req, res) => {
  const { data: config, error } = await supabase
    .from("event_config")
    .select("started_at, duration_minutes, ended_at")
    .eq("id", 1)
    .single();

  if (error || !config) {
    return res.status(404).json({ error: "Event config not found" });
  }

  res.json({
    started_at: config.started_at,
    duration_minutes: config.duration_minutes,
    ended_at: config.ended_at,
  });
});

module.exports = router;
