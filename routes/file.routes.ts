import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { marked } from "marked";
import { FileService } from "../services/file.service";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { lintMarkdown } from "../utils/lintMakrdown";

const fileRoutes = new Hono();

const saveNoteSchema = z.object({
  note: z.string()
}).required();

let fileService: FileService;

fileRoutes.use(async (_, next) => {
  if (!fileService) {
    fileService = new FileService();
  }
  await next();
});

const BODY_LIMIT = 16 * 1024 * 1024;

fileRoutes.post("/upload", bodyLimit({ maxSize: BODY_LIMIT }), async (c) => {
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

fileRoutes.get("/:id", async (c) => {
  const fileId = c.req.param("id");
  try {
    const file = await fileService.getFile(fileId);

    if (!file) {
      return c.notFound();
    }

    if (file.data) {
      let html = await marked(file.data.toString());
      c.header('Content-Type', 'text/html')
      return c.html(html);
    }
    return c.notFound();
  } catch (err: any) {
    console.error(`Error in get file route: ${err.message}`);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

fileRoutes.post("/save/:id", zValidator("json", saveNoteSchema), async (c) => {
  const fileId = c.req.param("id");
  const { note } = c.req.valid("json");

  try {
    let file = await fileService.getFile(fileId);
    if (!file) {
      return c.notFound();
    }

    if (file.data) {
      let newData = Buffer.concat([file.data, Buffer.from(note)]);
      file.data = newData;
      await file.save();

      let html = await marked(newData.toString());
      c.header('Content-Type', 'text/html');
      return c.html(html);
    }

    return c.notFound();
  } catch (err: any) {
    console.error(`Error in save note route: ${err.message}`);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default fileRoutes;
