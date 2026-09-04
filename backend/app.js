require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3005;

// Behind Vercel (or any single reverse proxy) req.ip is the proxy's address
// unless this is set, which would collapse every player onto one rate-limit
// key -- 5 logins per minute for the whole event. Keep this at the exact
// number of proxies in front of the app; `true` would let clients spoof
// X-Forwarded-For and dodge the limiter entirely.
app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS ?? 1));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

app.use("/api", require("./routes/eventRoutes"));
app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/teamRoutes"));
app.use("/api", require("./routes/adminRoutes"));

app.get("/health", async (req, res) => {
  const supabase = require("./db/supabaseClient");
  let dbStatus = "ok";
  try {
    if (supabase) {
      await supabase.from("event_config").select("id").limit(1);
    }
  } catch {
    dbStatus = "degraded";
  }
  res.json({
    status: dbStatus === "ok" ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: "error",
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.userId || null,
  }));
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? "Internal server error" : err.message,
  });
});

let server;

if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

function shutdown(signal) {
  console.log(`${signal} received, shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
  setTimeout(() => {
    console.error("Forced shutdown");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

module.exports = app;
