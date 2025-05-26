import express from "express";
import { getNote, createNote, updateNote, deleteNote } from "../controllers/NoteController.js";
import { register, login, logout, getLoggedInUser } from "../controllers/UserController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { getAccessToken } from "../controllers/TokenController.js";

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/token', getAccessToken);
router.delete('/logout', verifyToken, logout);
router.get('/user', verifyToken, getLoggedInUser);

router.get('/notes', verifyToken, getNote);
router.post('/notes', verifyToken, createNote);
router.put('/notes/:id', verifyToken, updateNote);
router.delete('/notes/:id', verifyToken, deleteNote);

export default router;