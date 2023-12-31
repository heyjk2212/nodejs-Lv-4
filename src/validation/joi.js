import Joi from "joi";

// 메뉴 등록을 위한 스키마
const menuRegistrationSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().min(1).max(100).required(),
  image: Joi.string().min(1).max(2083), // 일반적으로 URL의 최대 길이는 2,083 문자이다
  price: Joi.number().integer().min(0).required(), // 0보다 크거나 같아야 한다.
});

// 메뉴 업데이트 스키마
const menuUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().min(1).max(100).required(),
  price: Joi.number().integer().min(0).required(), // 0보다 크거나 같아야 한다.
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

// 회원가입을 위한 스키마
const usersSchema = Joi.object({
  // alphanum() // 알파벳 대소문자 및 숫자로만 구성
  nickname: Joi.string().min(3).max(15).alphanum().required(),
  password: Joi.string()
    .min(8)
    .max(20)
    .invalid(Joi.ref("nickname")) // 닉네임과 같은 값이 포함된 경우를 회원가입 실패로 처리
    .required()
    .messages({
      // .messages()를 사용하여, 유효성 검사 실패 시 출력될 에러 메시지를 설정
      "any.invalid": '"password"는 닉네임과 유사하거나 동일할 수 없습니다.',
    }),
  type: Joi.string().valid("CUSTOMER", "OWNER"),
});

export {
  menuRegistrationSchema,
  menuUpdateSchema,
  paramsSchema,
  categoryRegistrationSchema,
  categoryUpdateSchema,
  categoryParamsSchema,
  usersSchema,
};
