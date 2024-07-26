import markdownlint from "markdownlint";

export async function lintMarkdown(markdownText: string) {
  return new Promise((resolve, reject) => {
    const options: markdownlint.Options = {
      strings: {
        content: markdownText
      }
    };

    markdownlint(options, (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      if (result !== undefined && result.content.length > 0) {
        resolve(result.toString());
      } else {
        resolve("No issuses found in the Markdown file");
      }
    });
  });
}
