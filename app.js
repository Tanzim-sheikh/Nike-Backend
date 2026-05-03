import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";

import routes from "./src/routes/index.js";
import errorHandler from "./src/middleware/error.js";

const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://nike-taas.netlify.app",
    "http://localhost:5173",
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.get('/api/test-db', async (req, res) => {
  try {
    await connectDB();
    res.json({ message: 'DB connected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use("/api", routes);

// must be last
app.use(errorHandler);

export default app;
