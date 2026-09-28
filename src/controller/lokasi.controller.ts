import { Request, Response } from 'express';
import dbPromise from '../config/database';
import { sendSuccess, sendError } from '../utils/response';

// 1. Get Semua Ruangan
export const getAllLokasi = async (req: Request, res: Response) => {
  try {
    const db = await dbPromise;
    const [rows] = await db.query('SELECT * FROM inv_lokasi');
    return sendSuccess(res, 'Berhasil mengambil data ruangan', rows);
  } catch (error: any) {
    console.error('Get All Ruangan Error:', error);
    return sendError(res, 'Gagal mengambil data ruangan', 500, error.message);
  }
};

// 2. Get Ruangan Berdasarkan replid
export const getLokasiById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ID dari URL parameter
    const db = await dbPromise;
    const [rows]: any = await db.query('SELECT * FROM inv_lokasi WHERE replid = ?', [id]);

    if (rows.length === 0) {
      return sendError(res, 'Ruangan tidak ditemukan', 404);
    }

    return sendSuccess(res, 'Berhasil mengambil detail ruangan', rows[0]);
  } catch (error: any) {
    console.error('Get Ruangan By ID Error:', error);
    return sendError(res, 'Gagal mengambil detail ruangan', 500, error.message);
  }
};

// 3. Tambah Ruangan Baru
export const createLokasi = async (req: Request, res: Response) => {
  try {
    const { nama_ruangan, kode_ruangan, status, keterangan } = req.body;

    // Validasi field wajib
    if (!nama_ruangan || !kode_ruangan) {
      return sendError(res, 'Nama ruangan dan kode ruangan wajib diisi', 400);
    }

    const db = await dbPromise;
    const [result]: any = await db.query(
      'INSERT INTO inv_lokasi (nama_ruangan, kode_ruangan, status, keterangan) VALUES (?, ?, ?, ?)',
      [nama_ruangan, kode_ruangan, status || 'tersedia', keterangan || null]
    );

    return sendSuccess(res, 'Ruangan berhasil ditambahkan', {
      replid: result.insertId,
      nama_ruangan,
      kode_ruangan,
      status: status || 'tersedia',
      keterangan
    }, 201);
  } catch (error: any) {
    console.error('Create Ruangan Error:', error);
    return sendError(res, 'Gagal menambahkan ruangan', 500, error.message);
  }
};

// 4. Update Ruangan
export const updateLokasi = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // replid
    const { nama_ruangan, kode_ruangan, status, keterangan } = req.body;

    if (!nama_ruangan || !kode_ruangan) {
      return sendError(res, 'Nama ruangan dan kode ruangan wajib diisi', 400);
    }

    const db = await dbPromise;
    
    // Cek apakah ruangan ada
    const [existing]: any = await db.query('SELECT replid FROM inv_lokasi WHERE replid = ?', [id]);
    if (existing.length === 0) {
      return sendError(res, 'Ruangan tidak ditemukan', 404);
    }

    await db.query(
      'UPDATE inv_lokasi SET nama_ruangan = ?, kode_ruangan = ?, status = ?, keterangan = ? WHERE replid = ?',
      [nama_ruangan, kode_ruangan, status || 'tersedia', keterangan || null, id]
    );

    return sendSuccess(res, 'Ruangan berhasil diperbarui', { 
      replid: Number(id), 
      nama_ruangan, 
      kode_ruangan, 
      status, 
      keterangan 
    });
  } catch (error: any) {
    console.error('Update Ruangan Error:', error);
    return sendError(res, 'Gagal memperbarui ruangan', 500, error.message);
  }
};

// 5. Hapus Ruangan
export const deleteLokasi = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    const [existing]: any = await db.query('SELECT replid FROM inv_lokasi WHERE replid = ?', [id]);
    if (existing.length === 0) {
      return sendError(res, 'Ruangan tidak ditemukan', 404);
    }

    await db.query('DELETE FROM inv_lokasi WHERE replid = ?', [id]);

    return sendSuccess(res, 'Ruangan berhasil dihapus', null);
  } catch (error: any) {
    console.error('Delete Ruangan Error:', error);
    if (error.errno === 1451) {
       return sendError(res, 'Tidak bisa menghapus ruangan karena sedang digunakan oleh data barang', 400);
    }
    return sendError(res, 'Gagal menghapus ruangan', 500, error.message);
  }
};