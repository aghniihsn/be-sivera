import { Request, Response } from 'express';
import dbPromise from '../config/database';
import { sendSuccess, sendError } from '../utils/response';

// 1. Buat Transaksi Peminjaman Baru (Header + Detail + Kurangi Stok)
export const createPeminjaman = async (req: Request, res: Response) => {
  const { 
    user_id, 
    jenis_peminjaman, // 'barang' atau 'ruangan'
    lokasi_id,        // Wajib jika jenis_peminjaman === 'ruangan'
    tgl_rencana_kembali, 
    tujuan_peminjaman, 
    catatan,
    items             // Wajib jika jenis_peminjaman === 'barang'
  } = req.body;

  // 1. Validasi Input Dasar
  if (!user_id || !jenis_peminjaman) {
    return sendError(res, 'User ID dan jenis peminjaman wajib diisi', 400);
  }

  // 2. Validasi Kondisional berdasarkan jenis_peminjaman
  if (jenis_peminjaman === 'ruangan' && !lokasi_id) {
    return sendError(res, 'Untuk peminjaman ruangan, lokasi_id wajib diisi', 400);
  }

  if (jenis_peminjaman === 'barang' && (!items || items.length === 0)) {
    return sendError(res, 'Untuk peminjaman barang, minimal 1 item barang wajib dipilih', 400);
  }

  const db = await dbPromise;
  const connection = await db.getConnection(); 

  try {
    await connection.beginTransaction();

    const kode_peminjaman = `PMJ-${Date.now()}`;

    // 3. Insert Header Peminjaman (inv_peminjaman)
    const [headerResult]: any = await connection.query(
      `INSERT INTO inv_peminjaman 
      (user_id, lokasi_id, kode_peminjaman, jenis_peminjaman, tgl_peminjaman, tgl_pengajuan, tgl_rencana_kembali, status, tujuan_peminjaman, catatan) 
      VALUES (?, ?, ?, ?, NOW(), NOW(), ?, 'pending', ?, ?)`,
      [user_id, lokasi_id || null, kode_peminjaman, jenis_peminjaman, tgl_rencana_kembali, tujuan_peminjaman, catatan]
    );

    const peminjaman_id = headerResult.insertId;

    // 4. Jika Peminjaman BARANG: Proses Detail Peminjaman & Potong Stok
    if (jenis_peminjaman === 'barang' && items && items.length > 0) {
      for (const item of items) {
        // Cek stok barang
        const [barangRows]: any = await connection.query(
          'SELECT jumlah_tersedia, kondisi FROM inv_barang WHERE replid = ? FOR UPDATE', 
          [item.barang_id]
        );

        if (barangRows.length === 0) {
          throw new Error(`Barang dengan ID ${item.barang_id} tidak ditemukan`);
        }

        const barang = barangRows[0];

        if (barang.jumlah_tersedia < item.jumlah) {
          throw new Error(`Stok barang ID ${item.barang_id} tidak mencukupi. Tersisa: ${barang.jumlah_tersedia}`);
        }

        // Insert ke inv_detail_peminjaman
        await connection.query(
          `INSERT INTO inv_detail_peminjaman (peminjaman_id, barang_id, jumlah, kondisi_sebelum) 
           VALUES (?, ?, ?, ?)`,
          [peminjaman_id, item.barang_id, item.jumlah, barang.kondisi]
        );

        // Kurangi stok ketersediaan barang
        await connection.query(
          `UPDATE inv_barang SET jumlah_tersedia = jumlah_tersedia - ? WHERE replid = ?`,
          [item.jumlah, item.barang_id]
        );
      }
    }

    await connection.commit();

    return sendSuccess(res, `Berhasil membuat pengajuan peminjaman ${jenis_peminjaman}`, { 
      peminjaman_id, 
      kode_peminjaman 
    }, 201);

  } catch (error: any) {
    await connection.rollback(); 
    console.error('Create Peminjaman Error:', error);
    return sendError(res, error.message || 'Gagal membuat transaksi peminjaman', 500);
  } finally {
    connection.release();
  }
};

// 2. Get Semua Data Peminjaman (List)
export const getAllPeminjaman = async (req: Request, res: Response) => {
  try {
    const db = await dbPromise;
    const query = `
      SELECT p.*, u.nama as nama_peminjam, l.nama_ruangan 
      FROM inv_peminjaman p
      LEFT JOIN inv_users u ON p.user_id = u.replid
      LEFT JOIN inv_lokasi l ON p.lokasi_id = l.replid
      ORDER BY p.tgl_pengajuan DESC
    `;
    const [rows] = await db.query(query);
    return sendSuccess(res, 'Berhasil mengambil data peminjaman', rows);
  } catch (error: any) {
    console.error('Get Peminjaman Error:', error);
    return sendError(res, 'Gagal mengambil data', 500);
  }
};