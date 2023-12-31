import express from "express";
import { prisma } from "../utils/prisma/index.js";
import {
  menuRegistrationSchema,
  categoryParamsSchema,
  menuUpdateSchema,
  paramsSchema,
} from "../validation/joi.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 5. 메뉴 등록 API
router.post(
  "/categories/:categoryId/menus",
  authMiddleware,
  async (req, res, next) => {
    try {
      // 클라이언트가 로그인된 사용자인지 검증한다. (사용자 인증 미들웨어를 통해서 수행할 수 있다.)
      const { type, userId } = req.user;
      // console.log(user); // user객체는 userId, nickname, password, type을 가지고 있다
      // 로그인 토큰을 검사하여, 사장님(OWNER) 토큰일 경우에만 카테고리 등록 가능

      if (type !== "OWNER") {
        return res
          .status(400)
          .json({ errorMessage: "죄송합니다. OWNER가 아닙니다." });
      }

      // const { categoryId } = req.params;
      // const { name, description, image, price } = req.body;
      const validationBody = await menuRegistrationSchema.validateAsync(
        req.body
      );
      const validationParams = await categoryParamsSchema.validateAsync(
        req.params
      );

      const { categoryId } = validationParams;
      const { name, description, image, price } = validationBody;

      if (!categoryId) {
        return res
          .status(400)
          .json({ errorMessage: "데이터 형식이 올바르지 않습니다" });
      }

      if (!name || !description || !image || !price) {
        return res
          .status(400)
          .json({ errorMessage: "데이터 형식이 올바르지 않습니다" });
      }

      // maxOder값 찾기
      const maxOrder = await prisma.menus.findFirst({
        select: {
          order: true,
        },
        orderBy: {
          order: "desc", // 내림차순으로 정렬 - 최근에 추가한 order값이 맨 위로
        },
      });

      // 새롭게 메뉴가 추가되면 매 새로운 order값 할당
      const newOrder = maxOrder ? maxOrder.order + 1 : 1;

      // 등록하려는 카테고리가 실제로 존재하는지 확인
      const category = await prisma.categories.findFirst({
        where: {
          categoryId: +categoryId,
        },
      });

      if (!category) {
        return res
          .status(404)
          .json({ errorMessage: "카테고리가 존재하지 않습니다." });
      }

      // 전달받은 데이터 db에 저장한다
      await prisma.menus.create({
        data: {
          CategoryId: +categoryId,
          name,
          description,
          image,
          price,
          order: newOrder,
        },
      });

      return res.status(201).json({ message: "메뉴를 등록하였습니다." });
    } catch (error) {
      console.error(error);

      if (error.name === "ValidationError") {
        return res.status(400).json({ errorMessage: error.message });
      }

      next(error); // 에러 핸들링 미들웨어
    }
  }
);

// 6. 카테고리별 메뉴 조회 API
router.get("/categories/:categoryId/menus", async (req, res, next) => {
  try {
    // 특정 카테고리의 메뉴를 조회하기 위함
    // const { categoryId } = req.params;

    const validation = await categoryParamsSchema.validateAsync(req.params);
    const { categoryId } = validation;

    if (!categoryId) {
      return res
        .status(400)
        .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
    }

    // 실제로 카테고리가 존재하는지 확인
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

    // db에서 데이터를 가져온다
    const menus = await prisma.menus.findMany({
      where: {
        CategoryId: +categoryId,
      },
      select: {
        menuId: true,
        name: true,
        image: true,
        price: true,
        order: true,
        status: true,
      },
      orderBy: {
        order: "desc",
      },
    });

    return res.status(200).json({ data: menus });
  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ errorMessage: error.message });
    }

    next(error); // 에러 핸들링 미들웨어
  }
});

// 7. 메뉴 상세 조회 API
router.get("/categories/:categoryId/menus/:menuId", async (req, res, next) => {
  try {
    // const { categoryId, menuId } = req.params;

    const validationParams = await paramsSchema.validateAsync(req.params);
    const { categoryId, menuId } = validationParams;

    if (!categoryId && !menuId) {
      return res
        .status(400)
        .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
    }

    // 조회하려고 하는 카테고리가 실제로 존재하는지 확인
    const category = await prisma.categories.findFirst({
      where: {
        categoryId: +categoryId,
      },
    });

    if (!category) {
      return res
        .status(404)
        .json({ errorMessage: "존재하지 않는 카테고리입니다" });
    }

    // 조회하려고 하는 메뉴가 실제로 존재하는지 확인
    const menu = await prisma.menus.findFirst({
      where: {
        CategoryId: +categoryId,
        menuId: +menuId,
      },
    });

    if (!menu) {
      return res.status(404).json({ errorMessage: "존재하지 않는 메뉴입니다" });
    }

    // db에서 데이터 불러오기
    const menus = await prisma.menus.findMany({
      where: {
        CategoryId: +categoryId,
        menuId: +menuId,
      },
      select: {
        menuId: true,
        name: true,
        description: true,
        image: true,
        price: true,
        order: true,
        status: true,
      },
    });

    return res.status(200).json({ data: menus });
  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ errorMessage: error.message });
    }

    next(error); // 에러 핸들링 미들웨어
  }
});

// 8. 메뉴 수정 API
router.patch(
  "/categories/:categoryId/menus/:menuId",
  authMiddleware,
  async (req, res, next) => {
    try {
      // 클라이언트가 로그인된 사용자인지 검증한다. (사용자 인증 미들웨어를 통해서 수행할 수 있다.)
      const { type, userId } = req.user;
      // console.log(user); // user객체는 userId, nickname, password, type을 가지고 있다
      // 로그인 토큰을 검사하여, 사장님(OWNER) 토큰일 경우에만 카테고리 등록 가능

      if (type !== "OWNER") {
        return res
          .status(400)
          .json({ errorMessage: "죄송합니다. OWNER가 아닙니다." });
      }

      // const { categoryId, menuId } = req.params;
      const validationParams = await paramsSchema.validateAsync(req.params);
      const { categoryId, menuId } = validationParams;

      // const { name, description, price, order, status } = req.body;
      const validateBodyData = await menuUpdateSchema.validateAsync(req.body);
      const { name, description, price, order, status } = validateBodyData;

      if (!categoryId && !menuId) {
        return res
          .status(400)
          .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
      }

      // 실제 메뉴가 존재하는지 확인
      const menu = await prisma.menus.findFirst({
        where: {
          CategoryId: +categoryId,
          menuId: +menuId,
        },
      });

      if (!menu) {
        return res
          .status(404)
          .json({ errorMessage: "메뉴가 존재하지 않습니다." });
      }

      // 메뉴 수정하기
      await prisma.menus.update({
        where: {
          CategoryId: +categoryId,
          menuId: +menuId,
        },
        data: {
          name,
          description,
          price,
          order,
          status,
        },
      });

      return res.status(201).json({ message: "메뉴를 수정하였습니다." });
    } catch (error) {
      console.error(error);

      if (error.name === "ValidationError") {
        return res.status(400).json({ errorMessage: error.message });
      }

      next(error); // 에러 핸들링 미들웨어
    }
  }
);

// 메뉴 삭제 API
router.delete(
  "/categories/:categoryId/menus/:menuId",
  authMiddleware,
  async (req, res, next) => {
    try {
      // 클라이언트가 로그인된 사용자인지 검증한다. (사용자 인증 미들웨어를 통해서 수행할 수 있다.)
      const { type, userId } = req.user;
      // console.log(user); // user객체는 userId, nickname, password, type을 가지고 있다
      // 로그인 토큰을 검사하여, 사장님(OWNER) 토큰일 경우에만 카테고리 등록 가능

      if (type !== "OWNER") {
        return res
          .status(400)
          .json({ errorMessage: "죄송합니다. OWNER가 아닙니다." });
      }

      // const { categoryId, menuId } = req.params;
      const validationParams = await paramsSchema.validateAsync(req.params);
      const { categoryId, menuId } = validationParams;

      if (!categoryId && !menuId) {
        return res
          .status(400)
          .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
      }

      // 실제 메뉴가 존재하는지 확인
      const menu = await prisma.menus.findFirst({
        where: {
          CategoryId: +categoryId,
          menuId: +menuId,
        },
      });

      if (!menu) {
        return res
          .status(404)
          .json({ errorMessage: "메뉴가 존재하지 않습니다." });
      }

      // db에서 삭제
      await prisma.menus.delete({
        where: {
          CategoryId: +categoryId,
          menuId: +menuId,
        },
      });

      return res.status(200).json({ message: "메뉴를 삭제하였습니다" });
    } catch (error) {
      console.error(error);

      if (error.name === "ValidationError") {
        return res.status(400).json({ errorMessage: error.message });
      }

      next(error); // 에러 핸들링 미들웨어
    }
  }
);
export default router;
