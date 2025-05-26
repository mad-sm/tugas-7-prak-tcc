import jwt from "jsonwebtoken"; 
import dotenv from "dotenv"; 
dotenv.config(); 

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET; 

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401); 

  jwt.verify(token, ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) return res.sendStatus(403); 
    req.username = decoded.username;
    next();
  });
};