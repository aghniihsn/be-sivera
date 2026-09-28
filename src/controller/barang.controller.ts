import { Request, Response } from 'express';
import dbPromise from '../config/database';
import { sendSuccess, sendError } from '../utils/response';

// 1. Get Semua Barang (Dilengkapi Nama Ruangan & Kategori)
export const getAllBarang = async (req: Request, res: Response) => {
  try {
    const db = await dbPromise;
    const query = `
      SELECT 
        b.*, 
        l.nama_ruangan, 
        k.nama_kategori 
      FROM inv_barang b
      LEFT JOIN inv_lokasi l ON b.lokasi_id = l.replid
      LEFT JOIN inv_kategori k ON b.kategori_id = k.replid
      ORDER BY b.replid DESC
    `;
    const [rows] = await db.query(query);
    return sendSuccess(res, 'Berhasil mengambil data barang', rows);
  } catch (error: any) {
    console.error('Get All Barang Error:', error);
    return sendError(res, 'Gagal mengambil data barang', 500, error.message);
  }
};

// 2. Get Barang Berdasarkan replid
export const getBarangById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    const query = `
      SELECT 
        b.*, 
        l.nama_ruangan, 
        k.nama_kategori 
      FROM inv_barang b
      LEFT JOIN inv_lokasi l ON b.lokasi_id = l.replid
      LEFT JOIN inv_kategori k ON b.kategori_id = k.replid
      WHERE b.replid = ?
    `;
    const [rows]: any = await db.query(query, [id]);

    if (rows.length === 0) {
      return sendError(res, 'Barang tidak ditemukan', 404);
    }

    return sendSuccess(res, 'Berhasil mengambil detail barang', rows[0]);
  } catch (error: any) {
    console.error('Get Barang By ID Error:', error);
    return sendError(res, 'Gagal mengambil detail barang', 500, error.message);
  }
};

// 3. Get Barang Tersedia (Digunakan untuk Dropdown / Pilihan UI Peminjaman & Transaksi)
export const getBarangTersedia = async (req: Request, res: Response) => {
  try {
    const db = await dbPromise;
    const [rows]: any = await db.query(`
      SELECT 
        b.replid AS barang_id,
        b.kode_barang,
        b.nama_barang,
        b.jumlah_tersedia,
        b.kondisi,
        b.satuan,
        l.replid AS lokasi_id,
        l.nama_ruangan AS nama_lokasi
      FROM inv_barang b
      LEFT JOIN inv_lokasi l ON b.lokasi_id = l.replid
      WHERE b.jumlah_tersedia > 0
      ORDER BY b.nama_barang ASC
    `);

    return sendSuccess(res, 'Berhasil mengambil daftar barang tersedia', rows);
  } catch (error: any) {
    console.error('Get Barang Tersedia Error:', error);
    return sendError(res, error.message || 'Gagal mengambil data barang tersedia', 500);
  }
};

// 4. Tambah Barang Baru
export const createBarang = async (req: Request, res: Response) => {
  try {
    const { 
      lokasi_id, 
      kategori_id, 
      kode_barang, 
      nama_barang, 
      jumlah_barang, 
      jumlah_tersedia, 
      kondisi, 
      satuan 
    } = req.body;

    if (!lokasi_id || !kategori_id || !kode_barang || !nama_barang || jumlah_barang === undefined) {
      return sendError(res, 'lokasi_id, kategori_id, kode_barang, nama_barang, dan jumlah_barang wajib diisi', 400);
    }

    // Jika jumlah_tersedia tidak dikirim, otomatis samakan dengan jumlah_barang (asumsi barang baru semuanya tersedia)
    const tersedia = jumlah_tersedia !== undefined ? jumlah_tersedia : jumlah_barang;

    const db = await dbPromise;
    const [result]: any = await db.query(
      `INSERT INTO inv_barang 
      (lokasi_id, kategori_id, kode_barang, nama_barang, jumlah_barang, jumlah_tersedia, kondisi, satuan) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [lokasi_id, kategori_id, kode_barang, nama_barang, jumlah_barang, tersedia, kondisi || 'Baik', satuan || 'Unit']
    );

    return sendSuccess(res, 'Barang berhasil ditambahkan', {
      replid: result.insertId,
      lokasi_id,
      kategori_id,
      kode_barang,
      nama_barang,
      jumlah_barang,
      jumlah_tersedia: tersedia,
      kondisi: kondisi || 'Baik',
      satuan: satuan || 'Unit'
    }, 201);
  } catch (error: any) {
    console.error('Create Barang Error:', error);
    if (error.errno === 1452) {
      return sendError(res, 'lokasi_id atau kategori_id tidak valid (tidak ditemukan di database)', 400);
    }
    return sendError(res, 'Gagal menambahkan barang', 500, error.message);
  }
};

// 5. Update Data Barang
export const updateBarang = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      lokasi_id, 
      kategori_id, 
      kode_barang, 
      nama_barang, 
      jumlah_barang, 
      jumlah_tersedia, 
      kondisi, 
      satuan 
    } = req.body;

    const db = await dbPromise;
    const [existing]: any = await db.query('SELECT replid FROM inv_barang WHERE replid = ?', [id]);
    
    if (existing.length === 0) {
      return sendError(res, 'Barang tidak ditemukan', 404);
    }

    await db.query(
      `UPDATE inv_barang 
       SET lokasi_id = ?, kategori_id = ?, kode_barang = ?, nama_barang = ?, 
           jumlah_barang = ?, jumlah_tersedia = ?, kondisi = ?, satuan = ? 
       WHERE replid = ?`,
      [lokasi_id, kategori_id, kode_barang, nama_barang, jumlah_barang, jumlah_tersedia, kondisi, satuan, id]
    );

    return sendSuccess(res, 'Barang berhasil diperbarui', { replid: Number(id), nama_barang });
  } catch (error: any) {
    console.error('Update Barang Error:', error);
    if (error.errno === 1452) {
      return sendError(res, 'lokasi_id atau kategori_id tidak valid', 400);
    }
    return sendError(res, 'Gagal memperbarui barang', 500, error.message);
  }
};

// 6. Hapus Barang
export const deleteBarang = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    const [existing]: any = await db.query('SELECT replid FROM inv_barang WHERE replid = ?', [id]);
    if (existing.length === 0) {
      return sendError(res, 'Barang tidak ditemukan', 404);
    }

    await db.query('DELETE FROM inv_barang WHERE replid = ?', [id]);

    return sendSuccess(res, 'Barang berhasil dihapus', null);
  } catch (error: any) {
    console.error('Delete Barang Error:', error);
    if (error.errno === 1451) {
      return sendError(res, 'Tidak bisa menghapus barang karena sedang terkait dengan data peminjaman, barang masuk, atau barang keluar', 400);
    }
    return sendError(res, 'Gagal menghapus barang', 500, error.message);
  }
};