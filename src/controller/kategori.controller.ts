import { Request, Response } from 'express';
import dbPromise from '../config/database';
import { sendSuccess, sendError } from '../utils/response';

// 1. Get Semua Kategori
export const getAllKategori = async (req: Request, res: Response) => {
  try {
    const db = await dbPromise;
    const [rows] = await db.query('SELECT * FROM inv_kategori');
    return sendSuccess(res, 'Berhasil mengambil data kategori', rows);
  } catch (error: any) {
    console.error('Get All Kategori Error:', error);
    return sendError(res, 'Gagal mengambil data kategori', 500, error.message);
  }
};

// 2. Get Kategori By ID
export const getKategoriById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    const [rows]: any = await db.query('SELECT * FROM inv_kategori WHERE replid = ?', [id]);

    if (rows.length === 0) {
      return sendError(res, 'Kategori tidak ditemukan', 404);
    }

    return sendSuccess(res, 'Berhasil mengambil detail kategori', rows[0]);
  } catch (error: any) {
    console.error('Get Kategori By ID Error:', error);
    return sendError(res, 'Gagal mengambil detail kategori', 500, error.message);
  }
};

// 3. Tambah Kategori Baru
export const createKategori = async (req: Request, res: Response) => {
  try {
    const { nama_kategori } = req.body;

    if (!nama_kategori) {
      return sendError(res, 'Nama kategori wajib diisi', 400);
    }

    const db = await dbPromise;
    const [result]: any = await db.query(
      'INSERT INTO inv_kategori (nama_kategori) VALUES (?)',
      [nama_kategori]
    );

    return sendSuccess(res, 'Kategori berhasil ditambahkan', {
      replid: result.insertId,
      nama_kategori
    }, 201);
  } catch (error: any) {
    console.error('Create Kategori Error:', error);
    return sendError(res, 'Gagal menambahkan kategori', 500, error.message);
  }
};

// 4. Update Kategori
export const updateKategori = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nama_kategori } = req.body;

    if (!nama_kategori) {
      return sendError(res, 'Nama kategori wajib diisi', 400);
    }

    const db = await dbPromise;
    const [existing]: any = await db.query('SELECT replid FROM inv_kategori WHERE replid = ?', [id]);
    
    if (existing.length === 0) {
      return sendError(res, 'Kategori tidak ditemukan', 404);
    }

    await db.query('UPDATE inv_kategori SET nama_kategori = ? WHERE replid = ?', [nama_kategori, id]);

    return sendSuccess(res, 'Kategori berhasil diperbarui', { replid: Number(id), nama_kategori });
  } catch (error: any) {
    console.error('Update Kategori Error:', error);
    return sendError(res, 'Gagal memperbarui kategori', 500, error.message);
  }
};

// 5. Hapus Kategori
export const deleteKategori = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    const [existing]: any = await db.query('SELECT replid FROM inv_kategori WHERE replid = ?', [id]);
    if (existing.length === 0) {
      return sendError(res, 'Kategori tidak ditemukan', 404);
    }

    await db.query('DELETE FROM inv_kategori WHERE replid = ?', [id]);

    return sendSuccess(res, 'Kategori berhasil dihapus', null);
  } catch (error: any) {
    console.error('Delete Kategori Error:', error);
    if (error.errno === 1451) {
       return sendError(res, 'Tidak bisa menghapus kategori karena ada barang yang menggunakan kategori ini', 400);
    }
    return sendError(res, 'Gagal menghapus kategori', 500, error.message);
  }
};