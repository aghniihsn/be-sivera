import { Request, Response } from 'express';
import dbPromise from '../config/database';
import { sendSuccess, sendError } from '../utils/response';

export const createBarangKeluar = async (req: Request, res: Response) => {
  // Sesuai dengan field di gambar inv_barang_keluar
  const { barang_id, jumlah, tgl_keluar, alasan_keluar, keterangan } = req.body;

  if (!barang_id || !jumlah) {
    return sendError(res, 'Barang ID dan jumlah wajib diisi', 400);
  }

  const db = await dbPromise;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Cek ketersediaan stok terlebih dahulu
    const [barangRows]: any = await connection.query(
      'SELECT jumlah_tersedia, jumlah_barang FROM inv_barang WHERE replid = ? FOR UPDATE',
      [barang_id]
    );

    if (barangRows.length === 0) {
      throw new Error(`Barang dengan ID ${barang_id} tidak ditemukan`);
    }

    if (barangRows[0].jumlah_tersedia < jumlah) {
      throw new Error(`Stok barang tidak mencukupi. Tersedia: ${barangRows[0].jumlah_tersedia}`);
    }

    // 2. Insert ke tabel inv_barang_keluar
    await connection.query(
      `INSERT INTO inv_barang_keluar (barang_id, jumlah, tgl_keluar, alasan_keluar, keterangan) 
       VALUES (?, ?, ?, ?, ?)`,
      [barang_id, jumlah, tgl_keluar || new Date(), alasan_keluar || null, keterangan || null]
    );

    // 3. Update kurangi stok total & stok tersedia di inv_barang
    await connection.query(
      `UPDATE inv_barang 
       SET jumlah_barang = jumlah_barang - ?, 
           jumlah_tersedia = jumlah_tersedia - ? 
       WHERE replid = ?`,
      [jumlah, jumlah, barang_id]
    );

    await connection.commit();

    return sendSuccess(res, 'Berhasil mencatat barang keluar dan mengurangi stok', null, 201);

  } catch (error: any) {
    await connection.rollback();
    console.error('Barang Keluar Error:', error);
    return sendError(res, error.message || 'Gagal memproses barang keluar', 500);
  } finally {
    connection.release();
  }
};