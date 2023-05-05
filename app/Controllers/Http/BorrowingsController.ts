import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Book from "App/Models/Book";
import Borrowing from "App/Models/Borrowing";
import User from "App/Models/User";
import InputBorrowingValidator from "App/Validators/InputBorrowingValidator";
import { DateTime } from "luxon";

export default class BorrowingsController {
  public async index({ response }: HttpContextContract) {
    try {
      const borrows = await Borrowing.all();

      if (borrows) {
        return response.ok({
          message: "berhasil mengambil data peminjaman",
          data: borrows,
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
            book,
            user: { nama: user?.nama, email: user?.email },
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
        tanggalPinjam: DateTime.local(),
        tanggalKembali: DateTime.local().plus({ days: 7 }),
      };

      if (payload.tanggal_pinjam) {
        let tanggalPinjam = new Date(payload.tanggal_pinjam);
        borrowInput.tanggalPinjam = DateTime.fromJSDate(tanggalPinjam);
      }

      if (payload.tanggal_kembali) {
        let tanggalKembali = new Date(payload.tanggal_kembali);
        borrowInput.tanggalKembali = DateTime.fromJSDate(tanggalKembali);
      }

      let newBorrow = await Borrowing.create(borrowInput);

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
        message: `gagal mengembalikan buku`,
      });
    } catch (error) {
      return response.badGateway({
        message: "gagal mengembalikan buku",
        errors: error,
      });
    }
  }
}
