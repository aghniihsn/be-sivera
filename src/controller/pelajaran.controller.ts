import { Request, Response } from 'express';
import dbPromise from '../config/database';
import { sendSuccess, sendError } from '../utils/response';

// 1. Get Semua Pelajaran (Dilengkapi Nama Ruangan)
export const getAllPelajaran = async (req: Request, res: Response) => {
  try {
    const db = await dbPromise;
    const query = `
      SELECT p.*, l.nama_ruangan 
      FROM inv_pelajaran p
      LEFT JOIN inv_lokasi l ON p.lokasi_id = l.replid
    `;
    const [rows] = await db.query(query);
    return sendSuccess(res, 'Berhasil mengambil data mata pelajaran', rows);
  } catch (error: any) {
    console.error('Get All Pelajaran Error:', error);
    return sendError(res, 'Gagal mengambil data mata pelajaran', 500, error.message);
  }
};

// 2. Get Pelajaran By ID
export const getPelajaranById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    const query = `
      SELECT p.*, l.nama_ruangan 
      FROM inv_pelajaran p
      LEFT JOIN inv_lokasi l ON p.lokasi_id = l.replid
      WHERE p.replid = ?
    `;
    const [rows]: any = await db.query(query, [id]);

    if (rows.length === 0) {
      return sendError(res, 'Mata pelajaran tidak ditemukan', 404);
    }

    return sendSuccess(res, 'Berhasil mengambil detail mata pelajaran', rows[0]);
  } catch (error: any) {
    console.error('Get Pelajaran By ID Error:', error);
    return sendError(res, 'Gagal mengambil detail mata pelajaran', 500, error.message);
  }
};

// 3. Tambah Pelajaran Baru
export const createPelajaran = async (req: Request, res: Response) => {
  try {
    const { lokasi_id, nama_pelajaran, hari, waktu_mulai, waktu_berakhir, kelas } = req.body;

    if (!lokasi_id || !nama_pelajaran || !hari || !waktu_mulai || !waktu_berakhir || !kelas) {
      return sendError(res, 'Semua field wajib diisi', 400);
    }

    const db = await dbPromise;
    const [result]: any = await db.query(
      `INSERT INTO inv_pelajaran (lokasi_id, nama_pelajaran, hari, waktu_mulai, waktu_berakhir, kelas) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [lokasi_id, nama_pelajaran, hari, waktu_mulai, waktu_berakhir, kelas]
    );

    return sendSuccess(res, 'Mata pelajaran berhasil ditambahkan', {
      replid: result.insertId,
      lokasi_id,
      nama_pelajaran,
      hari,
      waktu_mulai,
      waktu_berakhir,
      kelas
    }, 201);
  } catch (error: any) {
    console.error('Create Pelajaran Error:', error);
    if (error.errno === 1452) {
      return sendError(res, 'lokasi_id tidak valid (ruangan tidak ditemukan)', 400);
    }
    return sendError(res, 'Gagal menambahkan mata pelajaran', 500, error.message);
  }
};

// 4. Update Data Pelajaran
export const updatePelajaran = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { lokasi_id, nama_pelajaran, hari, waktu_mulai, waktu_berakhir, kelas } = req.body;

    const db = await dbPromise;
    const [existing]: any = await db.query('SELECT replid FROM inv_pelajaran WHERE replid = ?', [id]);
    
    if (existing.length === 0) {
      return sendError(res, 'Mata pelajaran tidak ditemukan', 404);
    }

    await db.query(
      `UPDATE inv_pelajaran 
       SET lokasi_id = ?, nama_pelajaran = ?, hari = ?, waktu_mulai = ?, waktu_berakhir = ?, kelas = ? 
       WHERE replid = ?`,
      [lokasi_id, nama_pelajaran, hari, waktu_mulai, waktu_berakhir, kelas, id]
    );

    return sendSuccess(res, 'Mata pelajaran berhasil diperbarui', { replid: Number(id), nama_pelajaran, kelas });
  } catch (error: any) {
    console.error('Update Pelajaran Error:', error);
    if (error.errno === 1452) {
      return sendError(res, 'lokasi_id tidak valid', 400);
    }
    return sendError(res, 'Gagal memperbarui mata pelajaran', 500, error.message);
  }
};

// 5. Hapus Pelajaran
export const deletePelajaran = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    const [existing]: any = await db.query('SELECT replid FROM inv_pelajaran WHERE replid = ?', [id]);
    if (existing.length === 0) {
      return sendError(res, 'Mata pelajaran tidak ditemukan', 404);
    }

    await db.query('DELETE FROM inv_pelajaran WHERE replid = ?', [id]);

    return sendSuccess(res, 'Mata pelajaran berhasil dihapus', null);
  } catch (error: any) {
    console.error('Delete Pelajaran Error:', error);
    if (error.errno === 1451) {
       return sendError(res, 'Tidak bisa menghapus pelajaran karena sudah digunakan di data peminjaman', 400);
    }
    return sendError(res, 'Gagal menghapus mata pelajaran', 500, error.message);
  }
};