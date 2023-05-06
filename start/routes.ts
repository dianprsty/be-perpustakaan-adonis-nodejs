/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from "@ioc:Adonis/Core/Route";

Route.get("/", async () => {
  return { hello: "world" };
});

Route.group(() => {
  Route.resource("kategori", "CategoriesController")
    .apiOnly()
    .middleware({
      update: ["auth", "check_petugas"],
      store: ["auth", "check_petugas"],
      destroy: ["auth", "check_petugas"],
    });

  Route.resource("buku", "BooksController")
    .apiOnly()
    .middleware({
      update: ["auth", "check_petugas"],
      store: ["auth", "check_petugas"],
      destroy: ["auth", "check_petugas"],
    });

  Route.group(() => {
    Route.post("register/user", "AuthController.register");
    Route.post("register/petugas", "AuthController.register");
    Route.post("otp-confirmation", "AuthController.otpConfirmation");
    Route.post("otp-resend", "AuthController.otpResend");
    Route.post("login", "AuthController.login").middleware("verify");
    Route.get("logout", "AuthController.logout").middleware("auth");
    Route.post("profile", "AuthController.profile").middleware("auth");
  }).prefix("auth");

  Route.get("peminjaman", "BorrowingsController.index");
  Route.get("peminjaman/:id", "BorrowingsController.show");
  Route.post("buku/:id/peminjaman", "BorrowingsController.store").middleware(
    "auth"
  );
  Route.get(
    "buku/:id/pengembalian",
    "BorrowingsController.returnBook"
  ).middleware("auth");
}).prefix("api/v1");
