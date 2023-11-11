import express from "express";
import CategoriesRouter from "./routes/categories.router.js";
import MenusRouter from "./routes/menus.router.js";

const app = express();
const PORT = 3000;

app.use(express.json()); // body-parser

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({ message: "Welcome" });
});

app.use("/api", [router, CategoriesRouter, MenusRouter]);

app.listen(PORT, () => {
  console.log(PORT, `Server running on port ${PORT}`);
});

export default app;
