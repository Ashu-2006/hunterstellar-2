const express = require("express");
const { getEventConfig } = require("../utils/eventConfigCache");

const router = express.Router();

router.get("/event", async (req, res) => {
  const { config, error } = await getEventConfig();

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
