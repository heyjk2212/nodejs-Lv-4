import express from "express";
import { prisma } from "../utils/prisma/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { usersSchema } from "../validation/joi.js";

const router = express.Router();

// 회원가입 API (소비자/사장님)
router.post("/sign-up", async (req, res, next) => {
  try {
    // const { nickname, password, type } = req.body;
    const validation = await usersSchema.validateAsync(req.body);
    const { nickname, password, type } = validation;

    // 동일한 닉네임을 가진 사용자가 있는지 확인
    const isExistingUser = await prisma.users.findFirst({
      where: {
        nickname, // 닉네임이 동일한 사람이 있다면 조회해라
      },
    });

    if (isExistingUser) {
      return res.status(409).json({ errorMessage: "중복된 닉네임입니다" });
    }

    const saltRounds = 10; // 암호화를 몇번반복해서 얼마나 복잡하게 만들거냐

    // 비밀번호 암호화하기
    // 시간이 많이 소요될 수 있기 때문에 await를 써서 비동적으로 처리할수 있도록 만들어줘야한다.
    // 암호화된 문자열을 만들기 위해서 hash() 메서드를 쓴다.
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.users.create({
      data: {
        nickname,
        password: hashedPassword,
        type,
      },
    });

    return res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ errorMessage: error.message });
    }

    return res
      .status(500)
      .json({ errorMessage: "서버에서 문제가 발생하였습니다." });
  }
});

// 로그인 API (소비자/사장님)
router.post("/sign-in", async (req, res, next) => {
  try {
    // const { nickname, password } = req.body;
    const validation = await usersSchema.validateAsync(req.body);
    const { nickname, password } = validation;

    // 닉네임이 존재하는지 확인
    const user = await prisma.users.findFirst({
      where: {
        nickname: nickname,
      },
    });

    // 존재하지 않으면
    if (!user) {
      return res
        .status(401)
        .json({ errorMessage: "닉네임 또는 패스워드를 확인해주세요." });
    }

    // 전달받은 비밀번호와 데이터베이스에 있는 비밀번호가 일치하는지 확인
    const result = await bcrypt.compare(password, user.password);

    // 검증에 실패했을 경우
    if (!result) {
      return res
        .status(401)
        .json({ errorMessage: "닉네임 또는 패스워드를 확인해주세요." });
    }

    // 로그인에 성공하면 쿠키에 필요한 JWT 발급
    const token = jwt.sign(
      {
        userId: user.userId,
      },
      // 서버에서 발급한 JWT가 맞는지 확인하기 위한 비밀키가 필요하다
      "customized_secret_key" // dotenv를 이용해서 외부에서 코드를 보더라고 알 수 없도록 구현해야 한다.
    );

    // 쿠키발급
    res.cookie("authorization", `Bearer ${token}`); // Bearer 토큰의 형식으로 jwt를 보낸다

    return res.status(200).json({ message: "로그인에 성공하였습니다." });
  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ errorMessage: error.message });
    }

    return res
      .status(500)
      .json({ errorMessage: "서버에서 문제가 발생하였습니다." });
  }
});

export default router;
