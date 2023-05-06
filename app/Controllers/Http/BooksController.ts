import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Book from "App/Models/Book";
import CreateBookValidator from "App/Validators/CreateBookValidator";
import UpdateBookValidator from "App/Validators/UpdateBookValidator";
import { DateTime } from "luxon";

export default class BooksController {
  /**
   * @swagger
   * /api/v1/buku:
   *   post:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Buku
   *     summary: Create Buku
   *     description: Menambah data buku
   *     requestBody:
   *       required: true
   *       content:
   *         application/x-www-form-urlencoded:
   *           description: User payload
   *           schema:
   *             $ref: '#/components/schemas/InputBookCreate'
   *     produces:
   *       - application/json
   *     responses:
   *       201:
   *         description: Created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 data:
   *                   type: array
   */
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

  /**
   * @swagger
   * /api/v1/buku:
   *   get:
   *     tags:
   *       - Buku
   *     summary: Get All Buku
   *     description: Mengambil semua data buku
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
   *                   type: array
   */
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

  /**
   * @swagger
   * /api/v1/buku/{id}:
   *   get:
   *     tags:
   *       - Buku
   *     summary: Get Buku By Id
   *     description: Mengambil semua data buku berdasarkan id
   *     parameters:
   *       - name: id
   *         in: path
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID buku
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
   */
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

  /**
   * @swagger
   * /api/v1/buku/{id}:
   *   put:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Buku
   *     summary: Update Buku
   *     description: Mengupdate data buku
   *     parameters:
   *       - name: id
   *         in: path
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID buku
   *     requestBody:
   *       required: true
   *       content:
   *         application/x-www-form-urlencoded:
   *           description: User payload
   *           schema:
   *             $ref: '#/components/schemas/InputBookUpdate'
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
   *                   type: array
   */
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

  /**
   * @swagger
   * /api/v1/buku/{id}:
   *   delete:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Buku
   *     summary: Delete Buku
   *     description: Menghapus buku berdasarkan id
   *     parameters:
   *       - name: id
   *         in: path
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID buku
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
   *                   type: array
   */
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
