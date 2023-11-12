# Node Lv.4

## ERD

<img src= "https://github.com/heyjk2212/nodejs-Lv-4/assets/147573753/b8acbdf6-a30d-4884-91d6-e20d20a4984c" width="700">

## API SPEC

### 3000 포트사용

- 회원가입 API             |  POST  | http://localhost:3000/api/sign-up  <br>
- 로그인 API               |  POST  | http://localhost:3000/api/sign-in  <br>
- 카테고리 등록 API        |  POST  | http://localhost:3000/api/categories  <br>
- 카테고리 조회 API        |  GET   | http://localhost:3000/api/categories  <br>
- 카테고리 수정 API        | PATCH  | http://localhost:3000/api/categories/:categoryId  <br>
- 카테고리 삭제 API        | DELETE | http://localhost:3000/api/categories/:categoryId  <br>
- 메뉴 등록 API            |  POST  | http://localhost:3000/api/categories/:CategoryId/menus  <br>
- 카테고리별 메뉴 조회 API  |  GET   | http://localhost:3000/api/categories/:CategoryId/menus/:menuId  <br>
- 메뉴 상세 조회 API        |  GET   | http://localhost:3000/api/categories/:CategoryId/menus/:menuId  <br>
- 메뉴 수정 API              | PATCH  | http://localhost:3000/api/categories/:CategoryId/menus/:menuId  <br>
- 메뉴 삭제 API              | DELETE | http://localhost:3000/api/categories/:CategoryId/menus/:menuId  <br>
