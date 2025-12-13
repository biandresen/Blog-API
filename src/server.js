import "dotenv/config";
import app from "./app.js";
import "./config/prismaClient.js";

const port = process.env.PORT || 4000;

// Behind Nginx reverse proxy:
app.set("trust proxy", 1);

// Only accept traffic from the same machine (Nginx will proxy to it)
app.listen(port, "127.0.0.1", () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on http://127.0.0.1:${port}`);
});
