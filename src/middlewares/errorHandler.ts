import { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/HttpError";

export const errorHandler = (
  err: Error | HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err); // Log do erro

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      message: err.message,
      statusCode: err.statusCode,
    });
  }

  // Fallback para erros inesperados
  return res.status(500).json({
    message: "Internal Server Error",
    statusCode: 500,
  });
};
