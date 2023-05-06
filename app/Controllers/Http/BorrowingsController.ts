import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Book from "App/Models/Book";
import Borrowing from "App/Models/Borrowing";
import User from "App/Models/User";
import InputBorrowingValidator from "App/Validators/InputBorrowingValidator";
import { DateTime } from "luxon";

export default class BorrowingsController {
  /**
   * @swagger
   * /api/v1/peminjaman:
   *   get:
   *     tags:
   *       - Peminjaman
   *     summary: Get All Peminjaman
   *     description: Mengambil semua data Peminjaman
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
      const borrows = await Borrowing.all();

      if (borrows) {
        let data = await Database.rawQuery(`select borrowings.*, nama, judul 
          from borrowings join users on borrowings.user_id=users.id 
          join books on borrowings.book_id=books.id`);

        return response.ok({
          message: "berhasil mengambil data peminjaman",
          data: data[0],
        });
      }

      return response.badGateway({
        message: "gagal mengambil data peminjaman",
      });
    } catch (error) {
      return response.badGateway({
        message: "gagal mengambil data peminjaman",
        errors: error,
      });
    }
  }

  /**
   * @swagger
   * /api/v1/peminjaman/{id}:
   *   get:
   *     tags:
   *       - Peminjaman
   *     summary: Get Peminjaman By Id
   *     description: Mengambil semua data peminjaman berdasarkan id
   *     parameters:
   *       - name: id
   *         in: path
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID peminjaman
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
      const borrow = await Borrowing.findOrFail(params.id);

      if (borrow) {
        const book = await Book.find(borrow.bookId);
        const user = await User.find(borrow.userId);
        return response.ok({
          message: "berhasil mengambil data peminjaman",
          data: {
            ...borrow.$attributes,
            user: { nama: user?.nama, email: user?.email },
            book,
          },
        });
      }
    } catch (error) {
      if (Object.keys(error).length === 0) {
        return response.notFound({
          message: `peminjaman dengan id ${params.id} tidak ditemukan`,
        });
      }

      return response.notFound({
        message: "gagal mengambil data peminjaman",
        errors: error,
      });
    }
  }

  /**
   * @swagger
   * /api/v1/buku/{id}/peminjaman:
   *   post:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Peminjaman
   *     summary: Peminjaman Buku
   *     description: User yang sudah terverifikasi melakukan peminjaman buku yang stocknya masih ada dan dia sedang tidak meminjam buku yang sama (hanya bisa meminjam 1 buku)
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
   *             $ref: '#/components/schemas/InputBorrowing'
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
  public async store({ request, response, params, auth }: HttpContextContract) {
    const user = auth.user;
    const bookId = params.id;

    const payload = await request.validate(InputBorrowingValidator);

    try {
      if (!user) {
        return response.unauthorized({
          message: "invalid credential",
        });
      }

      const book = await Book.find(bookId);

      if (!book) {
        return response.notFound({
          message: `buku dengan id ${bookId} tidak ditemukan`,
        });
      }

      const borrows = await Borrowing.query().where("user_id", user.id);
      const notReturned = borrows.filter(
        (borrow) => !borrow.isReturned && borrow.bookId == bookId
      );
      if (notReturned.length > 0) {
        return response.badRequest({
          message:
            "gagal meminjam buku, buku telah dipinjam dan belum dikembalikan oleh user",
        });
      }

      if (book.stock == 0) {
        return response.badGateway({
          message: "gagal meminjam buku, stok tidak tersedia",
        });
      }

      let borrowInput = {
        userId: user.id,
        bookId,
        isReturned: false,
        tanggalPinjam: DateTime.local().toSQLDate(),
        tanggalKembali: DateTime.local().plus({ days: 7 }).toSQLDate(),
      };

      if (payload.tanggal_pinjam) {
        let tanggalPinjam = new Date(payload.tanggal_pinjam);
        borrowInput.tanggalPinjam =
          DateTime.fromJSDate(tanggalPinjam).toSQLDate();
      }

      if (payload.tanggal_kembali) {
        let tanggalKembali = new Date(payload.tanggal_kembali);
        borrowInput.tanggalKembali =
          DateTime.fromJSDate(tanggalKembali).toSQLDate();
      }

      let newBorrow = await Borrowing.create(borrowInput);

      book.stock--;
      book.save();

      if (newBorrow) {
        return response.created({
          message: "sukses meminjam buku",
          data: {
            peminjaman: newBorrow,
            user: {
              nama: user.nama,
              email: user.email,
            },
            buku: book,
          },
        });
      }

      return response.badGateway({
        message: "gagal meminjam buku",
      });
    } catch (error) {
      return response.badGateway({
        message: "gagal meminjam buku",
        errors: error,
      });
    }
  }

  /**
   * @swagger
   * /api/v1/buku/{id}/pengembalian:
   *   get:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Peminjaman
   *     summary: Pengembalian Buku
   *     description: User dapat mengembalikan buku yang dipinjamnya
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
   */
  public async returnBook({ response, params, auth }: HttpContextContract) {
    const user = auth.user;
    const bookId = params.id;

    try {
      if (!user) {
        return response.unauthorized({
          message: "invalid credential",
        });
      }

      const book = await Book.find(bookId);

      if (!book) {
        return response.notFound({
          message: `buku dengan id ${bookId} tidak ditemukan`,
        });
      }

      const borrows = await Borrowing.query().where("user_id", user.id);
      const index = borrows.findIndex(
        (borrow) => !borrow.isReturned && borrow.bookId == bookId
      );
      if (index >= 0) {
        const borrowingToReturn: Borrowing = borrows[index];
        borrowingToReturn.isReturned = true;
        borrowingToReturn.save();
        book.stock++;
        book.save();

        return response.ok({
          message: "berhasil mengambalikan buku",
          data: {
            peminjaman: borrowingToReturn,
            user: {
              nama: user.nama,
              email: user.email,
            },
            buku: book,
          },
        });
      }

      return response.notFound({
        message: `gagal mengembalikan buku, peminjaman tidak ditemukan`,
      });
    } catch (error) {
      return response.badGateway({
        message: "gagal mengembalikan buku",
        errors: error,
      });
    }
  }

  /**
   * @swagger
   * /api/v1/peminjaman/{id}:
   *   put:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Peminjaman
   *     summary: Update Peminjaman
   *     description: Mengupdate data Peminjaman
   *     parameters:
   *       - name: id
   *         in: path
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID Peminjaman
   *     requestBody:
   *       required: true
   *       content:
   *         application/x-www-form-urlencoded:
   *           description: User payload
   *           schema:
   *             $ref: '#/components/schemas/InputBorrowing'
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
    const payload = await request.validate(InputBorrowingValidator);

    try {
      const borrowing = await Borrowing.findOrFail(params.id);
      if (borrowing) {
        if (payload.tanggal_pinjam) {
          let tanggalPinjam = new Date(payload.tanggal_pinjam);
          borrowing.tanggalPinjam =
            DateTime.fromJSDate(tanggalPinjam).toSQLDate();
        }

        if (payload.tanggal_kembali) {
          let tanggalKembali = new Date(payload.tanggal_kembali);
          borrowing.tanggalKembali =
            DateTime.fromJSDate(tanggalKembali).toSQLDate();
        }
        borrowing.updatedAt = DateTime.local();
        borrowing.save();
        return response.ok({
          message: "berhasil update kategori",
          data: borrowing,
        });
      }
    } catch (error) {
      if (Object.keys(error).length === 0) {
        return response.notFound({
          message: `kategori dengan id ${params.id} tidak ditemukan`,
        });
      }
      return response.badGateway({
        message: "gagal update data kategori",
        errors: error,
      });
    }
  }

  /**
   * @swagger
   * /api/v1/peminjaman/{id}:
   *   delete:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Peminjaman
   *     summary: Delete Peminjaman
   *     description: Menghapus peminjaman berdasarkan id
   *     parameters:
   *       - name: id
   *         in: path
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID peminjaman
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
      const borrowing = await Borrowing.findOrFail(params.id);

      if (borrowing) {
        await borrowing.delete();
        return response.ok({
          message: `berhasil menghapus data peminjaman}`,
        });
      }
    } catch (error) {
      if (Object.keys(error).length === 0) {
        return response.notFound({
          message: `peminjaman dengan id ${params.id} tidak ditemukan`,
        });
      }
      return response.badGateway({
        message: `gagal menghapus data kategori`,
        error: error,
      });
    }
  }
}
