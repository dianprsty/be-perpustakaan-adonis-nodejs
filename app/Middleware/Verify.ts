import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class Verify {
  public async handle(
    { auth, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    if (!auth.user?.isVerified) {
      return response.unauthorized({
        message: "email belum diverifikasi",
      });
    }
    await next();
  }
}
