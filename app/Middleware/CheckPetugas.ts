import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class CheckPetugas {
  public async handle(
    { auth, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    if (auth.user?.role !== "petugas") {
      return response.unauthorized({
        messsge: "user tidak memiliki akses untuk membuat kategori",
      });
    }
    await next();
  }
}
