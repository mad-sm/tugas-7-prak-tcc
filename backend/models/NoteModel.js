import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const Note = db.define(
    "notes",
    {
        nama: Sequelize.STRING,
        judul: Sequelize.STRING,
        catatan: Sequelize.STRING,
    }
);

db.sync().then(() => console.log("Database synced"));

export default Note;