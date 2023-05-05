import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import LoginValidator from "App/Validators/LoginValidator";

export default class Verify {
  public async handle(
    { request, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    await request.validate(LoginValidator);
    const { email } = request.body();

    const user = await User.findBy("email", email);
    if (!user?.isVerified) {
      return response.unauthorized({
        message: "email belum diverifikasi",
      });
    }
    await next();
  }
}
