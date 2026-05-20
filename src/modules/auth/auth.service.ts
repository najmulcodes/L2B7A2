import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../config/db';
import { User, UserPublic } from '../../types';

const SALT_ROUNDS = 10;

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query<User>('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: 'contributor' | 'maintainer'
): Promise<UserPublic> => {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await pool.query<UserPublic>(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashedPassword, role]
  );
  return result.rows[0];
};

export const validatePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export const generateToken = (id: number, name: string, role: string): string => {
  return jwt.sign(
    { id, name, role },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );
};