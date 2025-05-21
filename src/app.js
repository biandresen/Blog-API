import express from "express";

const app = express();

app.use(express.json({ limit: "20kb" }));
app.use(
  express.urlencoded({
    extended: true,
    inflate: true,
    limit: "1mb",
    parameterLimit: 5000,
    type: "application/x-www-form-urlencoded",
  })
);

export default app;
