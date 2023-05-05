import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Book from "App/Models/Book";
import CreateBookValidator from "App/Validators/CreateBookValidator";
import UpdateBookValidator from "App/Validators/UpdateBookValidator";
import { DateTime } from "luxon";

export default class BooksController {
  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateBookValidator);

    try {
      const book = await Book.create(payload);
      console.log(payload);

      if (book) {
        return response.created({
          message: "sukses membuat data buku",
          data: book,
        });
      }
      return response.badGateway({
        message: "gagal membuat buku",
      });
    } catch (error) {
      return response.badGateway({
        message: "gagal membuat buku",
        errors: error,
      });
    }
  }

  public async index({ response }: HttpContextContract) {
    try {
      const books = await Book.all();

      if (books) {
        return response.ok({
          message: "berhasil mengambil data buku",
          data: books,
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
      const book = await Book.findOrFail(params.id);

      if (book) {
        return response.ok({
          message: "berhasil mengambil data buku",
          data: book,
        });
      }
    } catch (error) {
      if (Object.keys(error.length === 0)) {
        return response.notFound({
          message: `buku dengan id ${params.id} tidak ditemukan`,
        });
      }
      return response.badGateway({
        message: "gagal mengambil data buku",
        errors: error,
      });
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    const payload = await request.validate(UpdateBookValidator);

    try {
      const book = await Book.findOrFail(params.id);
      if (book) {
        await book.merge({ ...payload, updatedAt: DateTime.local() }).save();
        return response.ok({
          message: "berhasil update buku",
          data: book,
        });
      }
    } catch (error) {
      if (Object.keys(error).length === 0) {
        return response.notFound({
          message: `buku dengan id ${params.id} tidak ditemukan`,
        });
      }
      return response.badGateway({
        message: "gagal update data buku",
        errors: error,
      });
    }
  }

  public async destroy({ response, params }: HttpContextContract) {
    try {
      const book = await Book.findOrFail(params.id);

      if (book) {
        await book.delete();
        return response.ok({
          message: `berhasil menghapus data buku`,
        });
      }
    } catch (error) {
      if (Object.keys(error).length === 0) {
        return response.notFound({
          message: `buku dengan id ${params.id} tidak ditemukan`,
        });
      }
      return response.badGateway({
        message: `gagal menghapus data buku`,
        error: error,
      });
    }
  }
}
