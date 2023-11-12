import Joi from "joi";

// 메뉴 등록을 위한 스키마
const menuRegistrationSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().min(1).max(100).required(),
  image: Joi.string().min(1).max(100),
  price: Joi.number().integer(),
});

// 메뉴 업데이트 스키마
const menuUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().min(1).max(100).required(),
  price: Joi.number().integer(),
  order: Joi.number().integer(),
  // valid 메소드를 사용하여 허용되는 값을 명시적으로 지정할 수 있다.
  // 이렇게 하면 status 필드의 값은 'FOR_SALE' 또는 'SOLD_OUT' 중 하나여야 한다
  status: Joi.string().valid("FOR_SALE", "SOLD_OUT").min(1).max(10),
});

// 카테고리 파라미터 유효성 검사를 위한 스키마
const paramsSchema = Joi.object({
  categoryId: Joi.number().integer().required(),
  menuId: Joi.number().integer().required(),
});

// 카테고리 등록을 위한 스키마
const categoryRegistrationSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
});

// 카테고리 정보 변경을 위한 스키마
const categoryUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  order: Joi.number().integer().required(),
});

// 카테고리 파라미터 유효성 검사를 위한 스키마
const categoryParamsSchema = Joi.object({
  categoryId: Joi.number().integer().required(),
});

export {
  menuRegistrationSchema,
  menuUpdateSchema,
  paramsSchema,
  categoryRegistrationSchema,
  categoryUpdateSchema,
  categoryParamsSchema,
};
