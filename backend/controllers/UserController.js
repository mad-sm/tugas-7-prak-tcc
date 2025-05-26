import User from '../models/UserModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export const register = async (req, res) => {
    const { name, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
    }
    try {
        const user = await User.create({ name, username, password: hashedPassword });
        res.status(201).json("User created successfully");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const login = async (req, res) => {
    try {
    const { username, password } = req.body;

    const user = await User.findOne({
      where: { username: username },
    });

    if (user) {
      const userPlain = user.toJSON();
      const { password: _, refresh_token_SECRET: __, ...safeUserData } = userPlain;

      const decryptPassword = await bcrypt.compare(password, user.password);

      if (decryptPassword) {
        const accessToken = jwt.sign(
          safeUserData,
          ACCESS_TOKEN_SECRET, 
          { expiresIn: "30m" }
        );

        const refreshToken = jwt.sign(
          safeUserData,
          REFRESH_TOKEN_SECRET,
          { expiresIn: "1d" }
        );

        await User.update(
          { refresh_token_SECRET: refreshToken },
          {
            where: { id: user.id },
          }
        );

        // Masukkin refresh token ke cookie
        res.cookie("refreshToken", refreshToken, {
          httpOnly: false, // Ngatur cross-site scripting, untuk penggunaan asli aktifkan karena bisa nyegah serangan fetch data dari website "document.cookies"
          sameSite: "none", // Ngatur domain yg request misal kalo strict cuman bisa akses ke link dari dan menuju domain yg sama, lax itu bisa dari domain lain tapi cuman bisa get
          maxAge: 24 * 60 * 60 * 1000, // Ngatur lamanya token disimpan di cookie (dalam satuan ms)
          secure: false, // Ini ngirim cookies cuman bisa dari https, kenapa? nyegah skema MITM di jaringan publik, tapi pas development di false in aja
        });

        res.status(200).json({
          status: "Success",
          message: "Login Berhasil",
          accessToken,
        });
      } else {
        const error = new Error("Username atau password salah");
        error.statusCode = 400;
        throw error;
      }
    } else {
      const error = new Error("Username atau password salah");
      error.statusCode = 400;
      throw error;
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
}

export async function logout(req, res) {
  try {

    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      return res.status(401).json({ message: 'Access token is required' });
    }

    const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user.refresh_token) {
      const error = new Error("User tidak ditemukan");
      error.statusCode = 204;
      throw error;
    }

    const userId = user.id;

    await User.update(
      { refresh_token: null },
      {
        where: { id: userId },
      }
    );

    res.clearCookie("refreshToken");

    res.status(200).json({
      status: "Success",
      message: "Logout Berhasil",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
}

export const getLoggedInUser = async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      return res.status(401).json({ message: 'Access token is required' });
    }

    const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password', 'refresh_token'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}