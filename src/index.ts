import http from "http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";

//----------- ROUTES ------------
import userRoutes from "./routes/userRoutes";
import materialRoutes from "./routes/materialRoutes";
import cityRoutes from "./routes/cityRoutes";
import carrierRoutes from "./routes/carrierRoute";
import categoryRoutes from "./routes/categoryRoutes";

dotenv.config();

const app = express();
const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

app.use(cors());
app.use(express.json());

//TEST ENDPOINT
app.get("/api", (req, res) => {
  res.json({ status: "ok", message: "Servidor funcionando correctamente" });
});

app.use("/api/users", userRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/carriers", carrierRoutes);
app.use("/api/categories", categoryRoutes);

// Lógica de WebSockets
// io.on("connection", (socket) => {
//   console.log(`Nueva conexión conectada: ${socket.id}`);

//   socket.on("disconnect", () => {
//     console.log(`Usuario desconectado: ${socket.id}`);
//   });
// });

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
