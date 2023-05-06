import Mail from "@ioc:Adonis/Addons/Mail";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Otp from "App/Models/Otp";
import Profile from "App/Models/Profile";
import User from "App/Models/User";
import InputOtpConfirmationValidator from "App/Validators/InputOtpConfirmationValidator";
import InputProfileValidator from "App/Validators/InputProfileValidator";
import OtpResendValidator from "App/Validators/OtpResendValidator";
import RegisterValidator from "App/Validators/RegisterValidator";

export default class AuthController {
  /**
   * @swagger
   * /api/v1/auth/register/user:
   *  post:
   *     tags:
   *       - Auth
   *     summary: Buat akun baru dengan role user
   *     description: Register akun baru dengan Role User
   *     requestBody:
   *       required: true
   *       content:
   *         application/x-www-form-urlencoded:
   *           description: User payload
   *           schema:
   *             $ref: '#/components/schemas/InputRegister'
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                    nama:
   *                      type: string
   *                    email:
   *                      type: string
   *                    role:
   *                      type: string
   */

  /**
   * @swagger
   * /api/v1/auth/register/petugas:
   *  post:
   *     tags:
   *       - Auth
   *     summary: Buat akun baru dengan role petugas
   *     description: Register akun baru dengan Role petugas
   *     requestBody:
   *       required: true
   *       content:
   *         application/x-www-form-urlencoded:
   *           description: User payload
   *           schema:
   *             $ref: '#/components/schemas/InputRegister'
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                    nama:
   *                      type: string
   *                    email:
   *                      type: string
   *                    role:
   *                      type: string
   */
  public async register({ request, response }: HttpContextContract) {
    const payload = await request.validate(RegisterValidator);

    let arrUrl = request.url().split("/");
    const role = arrUrl[arrUrl.length - 1];

    try {
      const user = await User.create({
        nama: payload.nama,
        email: payload.email,
        password: payload.password,
        role,
      });

      let otp = 0;

      while (otp < 100000) {
        otp = Math.ceil(Math.random() * 1000000);
      }

      if (user) {
        await Otp.create({ otp, userId: user.id });
      }

      await Mail.sendLater((message) => {
        message
          .from("perpus@mail.co")
          .to(payload.email)
          .subject("Welcome Onboard!")
          .htmlView("emails/otp_verification", { otp });
      });

      return response.ok({
        message: "registrasi berhasil, silakan verifikasi email anda",
        data: { nama: payload.nama, email: payload.email, role },
      });
    } catch (error) {
      return response.badGateway({
        message: "register gagal",
        errors: error,
      });
    }
  }

  /**
   * @swagger
   * /api/v1/auth/login:
   *  post:
   *     tags:
   *       - Auth
   *     summary: Login dengan email yang terdaftar dan terverifikasi
   *     description: Login mengguakan email yang sebelumnya sudah register dan sudah melakukan otp confirmation
   *     requestBody:
   *       required: true
   *       content:
   *         application/x-www-form-urlencoded:
   *           description: User payload
   *           schema:
   *             $ref: '#/components/schemas/InputLogin'
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                    type:
   *                      type: string
   *                    token:
   *                      type: string
   *                    expires_at:
   *                      type: string
   */
  public async login({ request, response, auth }: HttpContextContract) {
    const payload = request.body();
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

  /**
   * @swagger
   * /api/v1/auth/logout:
   *   get:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Auth
   *     summary: Logout
   *     description: logout menghapus akses user menggunakan token, sehingga token tidak lagi bisa digunakan untuk authorization
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */
  public async logout({ auth, response }) {
    await auth.use("api").revoke();
    return response.ok({
      message: "berhasil logout",
    });
  }

  /**
   * @swagger
   * /api/v1/auth/otp-confirmation:
   *  post:
   *     tags:
   *       - Auth
   *     summary: Verifikasi user baru
   *     description: verifikasi user yang sudah register dengan OTP yang dikirim ke email
   *     requestBody:
   *       required: true
   *       content:
   *         application/x-www-form-urlencoded:
   *           description: User payload
   *           schema:
   *             $ref: '#/components/schemas/InputOtpConfirmation'
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */
  public async otpConfirmation({ request, response }: HttpContextContract) {
    const payload = await request.validate(InputOtpConfirmationValidator);

    try {
      const user = await User.findBy("email", payload.email);
      const otp = await Otp.findBy("user_id", user?.id);

      if (!(user && otp)) {
        return response.badGateway({
          message: "gagal verifikasi akun",
        });
      }

      if (user.isVerified) {
        return response.badRequest({
          message: "akun sudah terverifikasi",
        });
      }

      if (otp.otp === payload.otp) {
        user.isVerified = true;
        user.save();
        return response.ok({
          message: "berhasil verifikasi akun",
        });
      } else {
        return response.badRequest({
          message: "otp yang dimasukan salah",
        });
      }
    } catch (error) {
      return response.badGateway({
        message: "gagal verifikasi akun",
        errors: error,
      });
    }
  }

  /**
   * @swagger
   * /api/v1/auth/profile:
   *   post:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Auth
   *     summary: Login dengan email yang terdaftar dan terverifikasi
   *     description: Login mengguakan email yang sebelumnya sudah register dan sudah melakukan otp confirmation
   *     requestBody:
   *       required: true
   *       content:
   *         application/x-www-form-urlencoded:
   *           description: User payload
   *           schema:
   *             $ref: '#/components/schemas/InputProfile'
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */

  public async profile({ request, response, auth }: HttpContextContract) {
    if (!auth.user) {
      return response.unauthorized({
        message: "login diperlukan untuk mengubah profile",
      });
    }
    const payload = await request.validate(InputProfileValidator);

    try {
      const searchPayload = { userId: auth.user.id };
      await Profile.updateOrCreate(searchPayload, payload);

      return response.ok({
        message: "berhasil mengubah data profile",
      });
    } catch (error) {
      return response.badGateway({
        message: "gagal mengubah data profile",
        errors: error,
      });
    }
  }

  /**
   * @swagger
   * /api/v1/auth/otp-resend:
   *  post:
   *     tags:
   *       - Auth
   *     summary: Kirim ulang OTP
   *     description: Kirim ulang OTP ke email yang sudah register namun belum verifikasi
   *     requestBody:
   *       required: true
   *       content:
   *         application/x-www-form-urlencoded:
   *           description: User payload
   *           schema:
   *             $ref: '#/components/schemas/InputOtpResend'
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */
  public async otpResend({ request, response }: HttpContextContract) {
    const payload = await request.validate(OtpResendValidator);

    try {
      const user = await User.findByOrFail("email", payload.email);
      if (user.isVerified) {
        return response.unauthorized({
          message: "email sudah terverifikasi",
        });
      }

      let otp = 0;

      while (otp < 100000) {
        otp = Math.ceil(Math.random() * 1000000);
      }

      if (user) {
        let otpData = await Otp.findByOrFail("user_id", user.id);
        otpData.otp = otp;
        otpData.save();
      }

      await Mail.sendLater((message) => {
        message
          .from("perpus@mail.co")
          .to(payload.email)
          .subject("Welcome Onboard!")
          .htmlView("emails/otp_verification", { otp });
      });

      return response.ok({
        message: "berhasil request ulang otp",
        data: { nama: user.nama, email: user.email, role: user.role },
      });
    } catch (error) {
      return response.badGateway({
        message: "register gagal",
        errors: error,
      });
    }
  }
}
