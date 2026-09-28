import { Request, Response } from 'express';
import dbPromise from '../config/database';
import { sendSuccess, sendError } from '../utils/response';

export const createBarangMasuk = async (req: Request, res: Response) => {
  // Sesuai dengan field di gambar inv_barang_masuk
  const { barang_id, jumlah, tgl_masuk, sumber, keterangan } = req.body;

  if (!barang_id || !jumlah) {
    return sendError(res, 'Barang ID dan jumlah wajib diisi', 400);
  }

  const db = await dbPromise;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Insert ke tabel inv_barang_masuk
    await connection.query(
      `INSERT INTO inv_barang_masuk (barang_id, jumlah, tgl_masuk, sumber, keterangan) 
       VALUES (?, ?, ?, ?, ?)`,
      [barang_id, jumlah, tgl_masuk || new Date(), sumber || null, keterangan || null]
    );

    // 2. Update tambah stok total & stok tersedia di inv_barang
    await connection.query(
      `UPDATE inv_barang 
       SET jumlah_barang = jumlah_barang + ?, 
           jumlah_tersedia = jumlah_tersedia + ? 
       WHERE replid = ?`,
      [jumlah, jumlah, barang_id]
    );

    await connection.commit();

    return sendSuccess(res, 'Berhasil mencatat barang masuk dan menambah stok', null, 201);

  } catch (error: any) {
    await connection.rollback();
    console.error('Barang Masuk Error:', error);
    return sendError(res, error.message || 'Gagal memproses barang masuk', 500);
  } finally {
    connection.release();
  }
};