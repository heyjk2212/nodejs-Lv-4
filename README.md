# Node Lv.4

## ERD

![erd](https://github.com/heyjk2212/nodejs-Lv-4/assets/147573753/3c7842e0-c75b-429f-a8a8-dd311f2cae71)


## API SPEC

### 3000 포트사용

|기능|METHOD|URL|
|:--|:--:|:--|
| 회원가입 API |POST|http://localhost:3000/api/sign-up
|로그인 API |POST|http://localhost:3000/api/sign-in
|카테고리 등록 API|POST|http://localhost:3000/api/categories
|카테고리 조회 API |GET|http://localhost:3000/api/categories
|카테고리 수정 API  |PATCH|http://localhost:3000/api/categories/:categoryId
|카테고리 삭제 API |DELETE|http://localhost:3000/api/categories/:categoryId
|메뉴 등록 API|POST|http://localhost:3000/api/categories/:CategoryId/menus
|카테고리별 메뉴 조회 API|GET|http://localhost:3000/api/categories/:CategoryId/menus/:menuId
|메뉴 상세 조회 API  |GET|http://localhost:3000/api/categories/:CategoryId/menus/:menuId
| 메뉴 수정 API  | PATCH | http://localhost:3000/api/categories/:CategoryId/menus/:menuId
| 메뉴 삭제 API  | DELETE  |  http://localhost:3000/api/categories/:CategoryId/menus/:menuId
