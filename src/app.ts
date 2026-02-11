import express from 'express';
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import taskRoutes from './routes/task'
import helmet from 'helmet'
import { errorHandler } from "./middlewares/errorHandler";
import rateLimit from "express-rate-limit";
import cors from "cors";

const app = express();

app.disable('x-powered-by');

// Middlewares de parsing
app.use(express.json());

// Segurança
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Rate limit global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo de 100 requisições por IP por janela
  message: "Muitas requisições, tente novamente mais tarde.",
});
app.use(limiter); 

// Middleware global para Content-Type
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

// Swagger
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "To-Do List API",
      version: "1.0.0",
      description: "API simples de lista de tarefas com Node.js + Express",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // busca comentários nas rotas
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Bem-vindo à API To-Do List",
    version: "1.0.0",
    docs: "http://localhost:3000/api-docs",
  });
});
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});
app.use("/tasks", taskRoutes);


// Middleware de Erro
app.use(errorHandler);

export default app;