import { Hono } from "hono";
import fileRoutes from "./routes/file.routes";
import grammarCheckerRoutes from "./routes/grammar.checker.routes";
import { logger } from "hono/logger";

const app = new Hono();

app.use("*", logger());

app.get('/healthhecker', (c) => {
  return c.text("Hello Markdown Note App");
});

const apiRoutes = app.basePath("/api/v1")
  .route("/files", fileRoutes)
  .route("/grammar", grammarCheckerRoutes);

export default app;
export type ApiRoutes = typeof apiRoutes; // RPC for frontend
