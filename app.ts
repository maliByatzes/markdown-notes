import { Hono } from "hono";
import fileRoutes from "./routes/file.routes";

const app = new Hono();

app.get('/healthhecker', (c) => {
  return c.text("Hello Markdown Note App");
});

const apiRoutes = app.basePath("/api/v1")
  .route("/files", fileRoutes);

export default app;
export type ApiRoutes = typeof apiRoutes; // RPC for frontend
