import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

export default async function (req, res, next) {
  try {
    // 1. 클라이언트로부터 쿠키를 전달받는다.
    const { authorization } = req.cookies;

    // 2. 쿠키가 Bearer 토큰 형식인지 확인한다.
    const [tokenType, token] = authorization.split(" ");

    if (tokenType !== "Bearer")
      throw new Error("토큰 타입이 일치하지 않습니다.");

    // 3. 서버에서 발급한 JWT가 맞는지 검증한다.
    // jwt.verify()는 검증에 실패하면 에러가 발생하므로 try..catch로 감싸준다.
    const decodedToken = jwt.verify(token, "customized_secret_key");
    const userId = decodedToken.userId; // 전달받은 userId는 문자열 타입이다.

    // 4. JWT의 userId를 이용해서 사용자를 조회한다.
    const user = await prisma.users.findFirst({
      where: {
        userId: +userId,
      },
    });

    if (!user) {
      // userId를 조회했는데 user가 없을 경우에 서버에서 해당하는 쿠키는 정상적이지 않기 때문에
      // 서버에 있는 전달받은 쿠키를 삭제해야 한다.
      res.clearCookie("authorization");
      throw new Error("토큰 사용자가 존재하지 않습니다.");
    }

    // 5. `req.user`에 조회된 사용자 정보를 할당한다
    req.user = user;

    // 6. 다음 미들웨어를 실행한다.
    next();
  } catch (error) {
    // 만약에 쿠키 인증에 실패하였다면, 해당하는 클라이언트의 쿠키를 삭제해줘야한다.
    res.clearCookie("authorization"); // 특정 쿠키를 삭제시킨다.

    switch (error.name) {
      case "TokenExpiredError": // 토큰이 만료되었을 때 발생하는 에러
        return res.status(401).json({ errorMessage: "토큰이 만료되었습니다." });

      case "JsonWebTokenError": // 토큰에 검증이 실패했을 때 발생하는 에러
        return res
          .status(401)
          .json({ errorMessage: "토큰 인증에 실패하였습니다." });

      default:
        return (
          res
            .status(401)
            // error에 있는 message가 비어있을 때에만 "비 정상적인 요청입니다."라는 메시지를 출력한다.
            .json({ errorMessage: error.message ?? "비 정상적인 요청입니다." })
        );
    }
  }
}
