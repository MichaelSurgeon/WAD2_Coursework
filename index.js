// Core Node modules
import path from "path";
import { fileURLToPath } from "url";

// Third-party packages
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mustacheExpress from "mustache-express";

// Internal modules
import viewRoutes from "./routes/views.js";
import adminRoutes from "./routes/admin/index.js";
import { initDb } from "./models/_db.js";
import { ensureUser } from "./middlewares/ensureUser.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

await initDb();

app.engine(
  "mustache",
  mustacheExpress(path.join(__dirname, "views", "partials"), ".mustache")
);
app.set("view engine", "mustache");
app.set("views", path.join(__dirname, "views"));

// Security: Limit request sizes to prevent DoS attacks
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use("/static", express.static(path.join(__dirname, "public")));

app.use(ensureUser);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/", viewRoutes);
app.use("/admin", adminRoutes);

export const not_found = (req, res) =>
  res.status(404).render("pages/error", {
    title: "Page Not Found",
    message: "The page you're looking for doesn't exist.",
  });

// eslint-disable-next-line no-unused-vars
export const server_error = (err, req, res, next) => {
  console.error(err);
  const isDev = process.env.NODE_ENV !== "production";
  res.status(500).render("pages/error", {
    title: "Server Error",
    message: isDev ? err.message : "An error occurred. Please try again later.",
  });
};
app.use(not_found);
app.use(server_error);

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    console.log(`Yoga booking running on http://localhost:${PORT}`)
  );
}
