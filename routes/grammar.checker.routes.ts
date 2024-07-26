import { Hono } from "hono";
import { FileService } from "../services/file.service";
import { lintMarkdown } from "../utils/lintMakrdown";

const grammarCheckerRoutes = new Hono();

let fileService: FileService;

grammarCheckerRoutes.use(async (_, next) => {
  if (!fileService) {
    fileService = new FileService();
  }
  await next();
});

grammarCheckerRoutes.post("/check/:id", async (c) => {
  try {
    const fileId = c.req.param("id");

    const file = await fileService.getFile(fileId);
    if (!file) {
      return c.notFound();
    }

    if (file.data) {
      const markdownText = file.data.toString();
      const result = await lintMarkdown(markdownText);
      return c.text(result, 200);
    }

    return c.notFound();
  } catch (err: any) {
    console.error(`Error on the grammarCheckerRoutes route: ${err.message}`);
    return c.json({ error: "Internal Server Error" });
  }
});

export default grammarCheckerRoutes;
