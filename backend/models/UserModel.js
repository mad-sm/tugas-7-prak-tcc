import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const User = db.define(
    "users",
    {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        username: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        refresh_token: {
            type: Sequelize.STRING,
            allowNull: true,
        },
    }
);

db.sync().then(() => console.log("Database synced"));

export default User;