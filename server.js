const express = require("express");
const RateLimiter = require("express-rate-limit");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const authRoutes = require("./Routes/authRoutes");
const userRoutes = require("./Routes/userRoutes");
const recordsRoutes = require("./Routes/recordsRoutes");
const summaryRoutes = require("./Routes/summaryRoutes");
const lookupRoutes = require("./Routes/lookupRoutes");
const swaggerDocument = require("./swagger.json");

const app = express();

app.use(express.json());
app.use(cors());

// Auth rate limits are applied per-route in Routes/authRoutes.js
const limiterDefault = RateLimiter({ windowMs: 15 * 60 * 1000, max: 200 });

app.get("/", (req, res) => {
  res.status(200).json({ message: "FinancialTrackProject API is running" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordsRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/lookup", lookupRoutes);

// Apply default limiter to all other routes
app.use(limiterDefault);

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
process.on("SIGINT", () => {
  console.log("\n Shutting down gracefully...");
  server.close(() => {
    console.log(" Server closed");
    process.exit(0);
  });
  setTimeout(() => {
    console.error(" Forced shutdown");
    process.exit(1);
  }, 10000);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in usee. Please free the port and try again.`,
    );
    process.exit(1);
  }
  throw err;
});
