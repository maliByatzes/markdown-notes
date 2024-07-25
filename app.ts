import { Hono } from "hono";
import { logger } from "hono/logger";
import { FileService } from "./services/file.service";

const app = new Hono();

let fileService: FileService;

app.use("*", logger());

app.use(async (c, next) => {
  if (!fileService) {
    fileService = new FileService();
  }
  await next();
});

app.post("/upload", async (c) => {
  try {
    const body = await c.req.parseBody();

    let uploadedFile: File;
    if (body['file'] instanceof File) {
      uploadedFile = body['file'];
      // TODO: enforce the file type to only markdown
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const fileId = await fileService.saveFile(uploadedFile.name, uploadedFile.type, buffer);

      return c.json({ filedId: fileId.toString() }, 201);
    } else {
      return c.json({ error: "Invalid file format" }, 400);
    }
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

    c.header('Content-Type', file.contentType);
    c.header('Content-Disposition', `attachment; filename="${file.fileName}"`);
    return c.body(file.data);
  } catch (err: any) {
    console.error(`Error in get file route: ${err.message}`);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

app.get('/', (c) => {
  return c.text("Hello Markdown Note App");
});

export default app;
