import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { resumesRouter } from "./routes/resumes.js";
import { chatRouter } from "./routes/chat.js";
import { generateRouter } from "./routes/generate.js";
import { uploadRouter } from "./routes/upload.js";
import { paymentsRouter } from "./routes/payments.js";
import { downloadRouter } from "./routes/download.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Stripe webhook needs raw body - must be before express.json()
app.use("/webhooks/stripe", express.raw({ type: "application/json" }));

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

// Routes
app.use("/auth", authRouter);
app.use("/resumes", resumesRouter);
app.use("/resumes", chatRouter);
app.use("/resumes", generateRouter);
app.use("/upload", uploadRouter);
app.use("/resumes", downloadRouter);
app.use(paymentsRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
