import express from "express";
import cors from "cors";

import routes from "./src/routes/index.js";
import errorHandler from "./src/middleware/error.js";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

// must be last
app.use(errorHandler);

export default app;
