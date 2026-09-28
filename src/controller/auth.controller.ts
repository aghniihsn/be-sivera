import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dbPromise from '../config/database';
import { sendSuccess, sendError } from '../utils/response';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // 1. Validasi Input
    if (!username || !password) {
      return sendError(res, 'Username dan password wajib diisi', 400);
    }

    const db = await dbPromise;

    // 2. Cari user berdasarkan username
    const [rows]: any = await db.query(
      'SELECT * FROM inv_users WHERE username = ? LIMIT 1',
      [username]
    );

    if (rows.length === 0) {
      return sendError(res, 'Username atau password salah', 401);
    }

    const user = rows[0];

    // 3. Verifikasi Password (Cek Hash bcrypt / plain text fallback)
    let isPasswordValid = false;
    
    // Cek apakah password di DB sudah ter-hash bcrypt
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Fallback jika password di DB masih plain text
      isPasswordValid = password === user.password;
    }

    if (!isPasswordValid) {
      return sendError(res, 'Username atau password salah', 401);
    }

    // 4. Generate JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'sivera_secret_key_2026';
    const payload = {
      id: user.user_id || user.id,
      username: user.username,
      nama: user.nama || user.nama_user,
      role: user.role
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1d' });

    // 5. Response Data (Sesuai ekspektasi Ecme Template)
    const responseData = {
      user: payload,
      token
    };

    return sendSuccess(res, 'Login berhasil', responseData, 200);
  } catch (error: any) {
    console.error('Login Error:', error);
    return sendError(res, 'Terjadi kesalahan pada server', 500, error.message);
  }
};
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, nama, role } = req.body;

    // 1. Validasi Input
    if (!username || !password || !nama || !role) {
      return sendError(res, 'Field username, password, nama, dan role wajib diisi', 400);
    }

    // Validasi Role sesuai ENUM tabel inv_users
    const validRoles = ['admin', 'petugas', 'peminjam'];
    if (!validRoles.includes(role)) {
      return sendError(res, 'Role tidak valid. Pilihan role: admin, petugas, peminjam', 400);
    }

    const db = await dbPromise;

    // 2. Cek apakah username sudah terdaftar
    const [existingUsers]: any = await db.query(
      'SELECT username FROM inv_users WHERE username = ? LIMIT 1',
      [username]
    );

    if (existingUsers.length > 0) {
      return sendError(res, 'Username sudah digunakan, silakan pakai username lain', 400);
    }

    // 3. Hash password menggunakan Bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Simpan ke database inv_users
    const [result]: any = await db.query(
      'INSERT INTO inv_users (username, password, nama, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, nama, role]
    );

    const newUser = {
      id: result.insertId,
      username,
      nama,
      role
    };

    return sendSuccess(res, 'User berhasil didaftarkan', newUser, 201);
  } catch (error: any) {
    console.error('Register Error:', error);
    return sendError(res, 'Gagal mendaftarkan user', 500, error.message);
  }
};