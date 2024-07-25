import app from "./app";
import connectToMongoDB from "./db/connectToMongoDB";

connectToMongoDB();

Bun.serve({
  fetch: app.fetch,
});

console.log('Server is running');
