import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import LoginValidator from "App/Validators/LoginValidator";
import RegisterValidator from "App/Validators/RegisterValidator";

export default class AuthController {
  public async register({ request, response }: HttpContextContract) {
    const payload = await request.validate(RegisterValidator);

    let arrUrl = request.url().split("/");
    const role = arrUrl[arrUrl.length - 1];

    try {
      await User.create({
        nama: payload.nama,
        email: payload.email,
        password: payload.password,
        role,
      });
      return response.ok({
        message: "registrasi berhasil",
        data: { nama: payload.nama, email: payload.email, role },
      });
    } catch (error) {
      return response.badGateway({
        message: "register gagal",
        errors: error,
      });
    }
  }

  public async login({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(LoginValidator);

    try {
      let token = await auth
        .use("api")
        .attempt(payload.email, payload.password, { expiresIn: "7 days" });
      return response.ok({
        message: "berhasil login",
        data: token,
      });
    } catch (error) {
      return response.unauthorized({
        message: "password salah",
        errors: error,
      });
    }
  }

  public async logout({ auth, response }) {
    await auth.use("api").revoke();
    return response.ok({
      message: "berhasil logout",
    });
  }
}
