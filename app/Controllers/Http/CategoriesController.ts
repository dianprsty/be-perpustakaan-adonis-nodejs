import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Category from "App/Models/Category";
import CreateUpdateCategoryValidator from "App/Validators/CreateUpdateCategoryValidator";
import { DateTime } from "luxon";

export default class CategoriesController {
  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateUpdateCategoryValidator);
    console.log(payload);

    try {
      const category = await Category.create(payload);
      if (category) {
        return response.created({
          message: "sukses membuat kategori",
          data: category,
        });
      }

      return response.badGateway({
        message: "gagal membuat kategori",
      });
    } catch (error: unknown) {
      return response.badGateway({
        message: "gagal membuat kategori",
        errors: error,
      });
    }
  }

  public async index({ response }: HttpContextContract) {
    try {
      const categories = await Category.all();

      if (categories) {
        return response.ok({
          message: "berhasil mengambil data buku",
          data: categories,
        });
      }

      return response.badGateway({
        message: "gagal mengambil data buku",
      });
    } catch (error) {
      return response.badGateway({
        message: "gagal mengambil data buku",
        errors: error,
      });
    }
  }

  public async show({ response, params }: HttpContextContract) {
    try {
      const category = await Category.findOrFail(params.id);

      if (category) {
        return response.ok({
          message: "berhasil mengambil data kategori",
          data: category,
        });
      }

      return response.notFound({
        message: `kategori dengan id ${params.id} tidak ditemukan`,
      });
    } catch (error) {
      return response.notFound({
        message: `gagal mengambil data kategori`,
        errors: error,
      });
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    const payload = await request.validate(CreateUpdateCategoryValidator);

    try {
      const category = await Category.findOrFail(params.id);
      if (category) {
        category.nama = payload.nama;
        category.updatedAt = DateTime.local();
        category.save();
        return response.ok({
          message: "berhasil update kategori",
          data: category,
        });
      }
      return response.notFound({
        message: `kategori dengan id ${params.id} tidak ditemukan`,
      });
    } catch (error) {
      return response.badGateway({
        message: "gagal update data kategori",
        errors: error,
      });
    }
  }

  public async destroy({ response, params }: HttpContextContract) {
    try {
      const category = await Category.findOrFail(params.id);

      if (category) {
        await category.delete();
        return response.ok({
          message: `berhasil menghapus kategori ${category.nama}`,
        });
      }

      return response.notFound({
        message: `kategori dengan id ${params.id} tidak ditemukan`,
      });
    } catch (error) {
      return response.badGateway({
        message: `gagal menghapus data id`,
        error: error,
      });
    }
  }
}
