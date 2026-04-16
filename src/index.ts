import http from "http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

// 👇 IMPORTAMOS EL INICIALIZADOR DE SOCKETS 👇
import { initSocket } from "./config/socket";

//----------- ROUTES ------------
import userRoutes from "./routes/userRoutes";
import materialRoutes from "./routes/materialRoutes";
import cityRoutes from "./routes/cityRoutes";
import carrierRoutes from "./routes/carrierRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import clientRoutes from "./routes/clientRoutes";
import orderRoutes from "./routes/orderRoutes";
import orderItemRoutes from "./routes/orderItemRoutes";
import invoiceTypeRoutes from "./routes/invoiceTypeRoutes";

dotenv.config();

const app = express();

app.use(morgan("dev"));
const server = http.createServer(app);

// 👇 1. INICIALIZAMOS SOCKET.IO PASÁNDOLE EL SERVIDOR HTTP 👇
initSocket(server);

const corsOptions = {
  // Allow your specific Pinggy frontend URL
  origin: "https://rjhht-181-116-45-158.a.free.pinggy.link",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

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
app.use("/api/clients", clientRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/order-items", orderItemRoutes);
app.use("/api/invoice-types", invoiceTypeRoutes);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
