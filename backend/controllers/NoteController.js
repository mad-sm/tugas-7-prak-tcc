import Note from "../models/NoteModel.js";

// Get Notes
export const getNote = async (req, res) => {
    try {
        const response = await Note.findAll();
        res.status(200).json(response);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Create Note
export const createNote = async (req, res) => {
    try {
        const { nama, judul, catatan } = req.body;
        if (!nama || !judul || !catatan) {
            return res.status(400).json({ error: "Semua field harus diisi" });
        }
        await Note.create(req.body);
        res.status(201).json({ msg: "Note created" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Gagal menambahkan note" });
    }
};

// Update Note
export const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, judul, catatan } = req.body;
        if (!nama || !judul || !catatan) {
            return res.status(400).json({ error: "Semua field harus diisi" });
        }
        const result = await Note.update(req.body, { where: { id } });
        if (result[0] === 0) return res.status(404).json({ error: "Note tidak ditemukan" });
        res.status(200).json({ message: "Data berhasil diubah" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Gagal memperbarui data" });
    }
};

// Delete user
export const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Note.destroy({ where: { id } });
        if (!deleted) return res.status(404).json({ error: "Note tidak ditemukan" });
        res.status(200).json({ message: "Data berhasil dihapus" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Gagal menghapus data" });
    }
};
