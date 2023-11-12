import express from "express";
import { prisma } from "../utils/prisma/index.js";
import {
  categoryRegistrationSchema,
  categoryUpdateSchema,
  categoryParamsSchema,
} from "../validation/joi.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 1. 카테고리 등록 API
router.post("/categories", authMiddleware, async (req, res, next) => {
  try {
    // 클라이언트가 로그인된 사용자인지 검증한다. (사용자 인증 미들웨어를 통해서 수행할 수 있다.)
    const { type, userId } = req.user;
    // console.log(user); // user객체는 userId, nickname, password, type을 가지고 있다
    // 로그인 토큰을 검사하여, 사장님(OWNER) 토큰일 경우에만 카테고리 등록 가능

    if (type === "OWNER") {
      // const { name } = req.body;
      // 여기서 검증에 실패하면 에러가 발생
      const validation = await categoryRegistrationSchema.validateAsync(
        req.body
      );

      // 위에서 검증에 성공하면, validation에서 반환된 값을 쓴다.
      const { name } = validation;

      //400 - body를 입력받지 못한 경우
      if (!name) {
        return res
          .status(400)
          .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
      }

      // The most recently added order value
      const maxOrder = await prisma.categories.findFirst({
        select: {
          order: true,
        },
        orderBy: {
          order: "desc", // Sort in descending order
        },
      });

      // if the order value already exists, then 1 is added, and if the order value does not exist, 1 is assigned.
      const newOrder = maxOrder ? maxOrder.order + 1 : 1;

      // Store received data in db
      const category = await prisma.categories.create({
        data: {
          name,
          order: newOrder,
          UserId: userId,
        },
      });

      // Return result
      return res.status(201).json({ messge: "카테고리를 등록하였습니다." });
    } else {
      return res.status(400).json({ errorMessage: "OWNER가 아닙니다." });
    }
  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ errorMessage: error.message });
    }

    return res
      .status(500)
      .json({ errorMessage: "서버에서 에러가 발생하였습니다." });
  }
});

// 2. 카테고리 조회 API
router.get("/categories", async (req, res, next) => {
  try {
    const categories = await prisma.categories.findMany({
      select: {
        categoryId: true,
        name: true,
        order: true,
      },
      orderBy: {
        order: "desc",
      },
    });

    return res.status(200).json({ data: categories });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ errorMessage: "서버에서 에러가 발생하였습니다." });
  }
});

// 3. 카테고리 정보 변경 API
router.patch(
  "/categories/:categoryId",
  authMiddleware,
  async (req, res, next) => {
    try {
      // 클라이언트가 로그인된 사용자인지 검증한다. (사용자 인증 미들웨어를 통해서 수행할 수 있다.)
      const { type, userId } = req.user;
      // console.log(user); // user객체는 userId, nickname, password, type을 가지고 있다
      // 로그인 토큰을 검사하여, 사장님(OWNER) 토큰일 경우에만 카테고리 등록 가능

      if (type === "OWNER") {
        // const { categoryId } = req.params;
        // const { name, order } = req.body;
        const validationBody = await categoryUpdateSchema.validateAsync(
          req.body
        );
        const validationParams = await categoryParamsSchema.validateAsync(
          req.params
        );

        const { categoryId } = validationParams;
        const { name, order } = validationBody;

        if (!categoryId) {
          return res
            .status(400)
            .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
        }

        if (!name && !order) {
          return res
            .status(400)
            .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
        }

        // Check if the category exists
        const currentCategory = await prisma.categories.findFirst({
          where: {
            categoryId: +categoryId,
          },
        });

        if (!currentCategory) {
          return res
            .status(404)
            .json({ errorMessage: "존재하지 않는 카테고리입니다." });
        }

        // 만약 입력받은 order값이, 현재 카테고리의 order값이랑 다르다면!
        if (order !== currentCategory.order) {
          // 입력한 order값을 가지고 있는 카테고리 찾기
          const targetCategory = await prisma.categories.findFirst({
            where: {
              order: +order,
            },
          });

          // 만약 변경하려는 order값을 가진 카테고리가 존재하다면
          if (targetCategory) {
            const currentOrderValue = currentCategory.order; // 현재 카테고리의 order값

            // 1. currentCategory의 order값을 변경
            await prisma.categories.update({
              where: {
                categoryId: currentCategory.categoryId,
              },
              data: {
                order: +order,
              },
            });

            // 2. targetCategory의 order값을 변경
            await prisma.categories.update({
              where: {
                categoryId: targetCategory.categoryId,
              },
              data: {
                order: currentOrderValue,
              },
            });
          }
        } else {
          // 만약 입력받은 order값이, 현재 카테고리의 order값이랑 다르다면!
          await prisma.categories.update({
            where: {
              categoryId: +categoryId,
            },
            data: {
              name,
              order,
            },
          });
        }

        return res
          .status(200)
          .json({ message: "카테고리 정보를 수정하였습니다." });
      } else {
        return res.status(400).json({ errorMessage: "OWNER가 아닙니다." });
      }
    } catch (error) {
      console.error(error);

      if (error.name === "ValidationError") {
        return res.status(400).json({ errorMessage: error.message });
      }

      return res
        .status(500)
        .json({ errorMessage: "서버에서 에러가 발생하였습니다." });
    }
  }
);

// 4. 카테고리 삭제 API
router.delete(
  "/categories/:categoryId",
  authMiddleware,
  async (req, res, next) => {
    try {
      // 클라이언트가 로그인된 사용자인지 검증한다. (사용자 인증 미들웨어를 통해서 수행할 수 있다.)
      const { type, userId } = req.user;
      // console.log(user); // user객체는 userId, nickname, password, type을 가지고 있다
      // 로그인 토큰을 검사하여, 사장님(OWNER) 토큰일 경우에만 카테고리 등록 가능

      if (type === "OWNER") {
        // const { categoryId } = req.params;

        const validation2 = await categoryParamsSchema.validateAsync(
          req.params
        );
        const { categoryId } = validation2;

        if (!categoryId) {
          return res
            .status(400)
            .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
        }

        // 삭제하려는 카테고리가 실제로 db에 존재하는가
        const category = await prisma.categories.findFirst({
          where: {
            categoryId: +categoryId,
          },
        });

        if (!category) {
          return res
            .status(404)
            .json({ errorMessage: "존재하지 않는 카테고리입니다." });
        }

        // 삭제하려는 카테고리가 존재하면 db에서 찾아서 삭제
        await prisma.categories.delete({
          where: {
            categoryId: +categoryId,
          },
        });

        return res
          .status(200)
          .json({ message: "카테고리 정보를 삭제하였습니다." });
      } else {
        return res.status(400).json({ errorMessage: "OWNER가 아닙니다." });
      }
    } catch (error) {
      console.error(error);

      if (error.name === "ValidationError") {
        return res.status(400).json({ errorMessage: error.message });
      }

      return res
        .status(500)
        .json({ errorMessage: "서버에서 에러가 발생하였습니다" });
    }
  }
);

export default router;
