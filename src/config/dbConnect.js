import mongoose from "mongoose";

mongoose.connect("mongodb+srv://leonardo:123@cluster0.adihvau.mongodb.net/alura-node");

let db = mongoose.connection;

export default db;