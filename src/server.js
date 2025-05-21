import "dotenv/config";
import app from "./app.js";
import "./config/prismaClient.js";

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`));
