import { Hono } from "hono";
import { logger } from "hono/logger";

const app = new Hono();

app.use("*", logger());

app.post("/upload", async (c) => {
  try {
    const body = await c.req.parseBody();
    let uploadedFile: File;
    if (body['file'] instanceof File) {
      uploadedFile = body['file'];
      console.log(uploadedFile);
    }
    return c.text("Upload route");
  } catch (err: any) {
    console.error(`Error in upload route: ${err.message}`);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

app.get('/', (c) => {
  return c.text("Hello Markdown Note App");
});

export default app;
