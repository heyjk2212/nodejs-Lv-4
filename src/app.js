import express from "express";
import CategoriesRouter from "./routes/categories.router.js";
import MenusRouter from "./routes/menus.router.js";
import UsersRouter from "./routes/users.router.js";
import cookieParser from "cookie-parser";
import LogMiddleware from "./middlewares/log.middleware.js";
import ErrorHandlingMiddleware from "./middlewares/error-handling.middleware.js";

const app = express();
const PORT = 3000;

app.use(LogMiddleware);

app.use(express.json()); // body-parser
app.use(cookieParser());

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({ message: "Welcome" });
});

app.use("/api", [router, CategoriesRouter, MenusRouter, UsersRouter]);

app.use(ErrorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(PORT, `Server running on port ${PORT}`);
});

export default app;
