import { Hono } from "hono";
import { logger } from "hono/logger";
import { FileService } from "./services/file.service";
import { bodyLimit } from "hono/body-limit";
import { marked } from "marked";

const app = new Hono();

const BODY_LIMIT = 16 * 1024 * 1024;

let fileService: FileService;

app.use("*", logger());

app.use(async (_, next) => {
  if (!fileService) {
    fileService = new FileService();
  }
  await next();
});

app.post("/upload", bodyLimit({ maxSize: BODY_LIMIT }), async (c) => {
  try {
    const body = await c.req.parseBody();

    let uploadedFile: File;
    if (body['file'] instanceof File) {
      uploadedFile = body['file'];
    } else {
      return c.json({ error: "Invalid file format" }, 400);
    }

    if (uploadedFile.type !== "text/markdown") {
      return c.json({ error: "Invalid file format" }, 400);
    }

    if (uploadedFile.size > BODY_LIMIT) {
      return c.json({ error: "Exceeded file size limit" }, 400);
    }

    const arrayBuffer = await uploadedFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileId = await fileService.saveFile(uploadedFile.name, uploadedFile.type, buffer);

    return c.json({ filedId: fileId.toString() }, 201);
  } catch (err: any) {
    console.error(`Error in upload route: ${err.message}`);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

app.get("/file/:id", async (c) => {
  const fileId = c.req.param("id");

  try {
    const file = await fileService.getFile(fileId);

    if (!file) {
      return c.notFound();
    }

    const html = marked(file.data.toString());

    c.header('Content-Type', 'text/html')
    return c.html(html);
  } catch (err: any) {
    console.error(`Error in get file route: ${err.message}`);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

app.get('/', (c) => {
  return c.text("Hello Markdown Note App");
});

export default app;
