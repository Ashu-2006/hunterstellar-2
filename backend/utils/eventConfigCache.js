const supabase = require("../db/supabaseClient");

const CACHE_KEY = "config";
const TTL_MS = 5000;

const cache = new Map();

async function getEventConfig() {
  const now = Date.now();
  const cached = cache.get(CACHE_KEY);
  if (cached && now - cached.ts < TTL_MS) {
    return { config: cached.data, error: null };
  }

  const { data, error } = await supabase
    .from("event_config")
    .select("started_at, duration_minutes, ended_at")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return { config: null, error: error || { message: "Event config not found" } };
  }

  const config = {
    started_at: data.started_at,
    duration_minutes: data.duration_minutes,
    ended_at: data.ended_at,
  };
  cache.set(CACHE_KEY, { data: config, ts: now });
  return { config, error: null };
}

function invalidateEventConfigCache() {
  cache.delete(CACHE_KEY);
}

// In tests the supabase client is a hand-rolled mock whose `__testing.reset()`
// clears its in-memory tables. Mirror that reset into our cache so a test that
// swaps event_config rows never reads a stale value cached by a prior test.
if (supabase && supabase.__testing && typeof supabase.__testing.reset === "function") {
  const originalReset = supabase.__testing.reset;
  supabase.__testing.reset = () => {
    invalidateEventConfigCache();
    return originalReset();
  };
}

module.exports = { getEventConfig, invalidateEventConfigCache };
