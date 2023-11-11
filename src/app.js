import express from "express";
import CategoriesRouter from "./routes/categories.router.js";
import MenusRouter from "./routes/menus.router.js";

const app = express();
const PORT = 3000;

app.use(express.json()); // body-parser

app.get("/", (req, res) => {
  return res.status(200).send("Welcome");
});

app.use("/api", [CategoriesRouter, MenusRouter]);

app.listen(PORT, () => {
  console.log(PORT, `${PORT} 포트로 서버가 열렸습니다.`);
});

export default app;
