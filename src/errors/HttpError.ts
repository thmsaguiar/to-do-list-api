export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message); // chama o construtor da classe Error
    this.statusCode = statusCode; // armazena o código HTTP do erro

    // Força o objeto this a herdar corretamente de HttpError.prototype
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
