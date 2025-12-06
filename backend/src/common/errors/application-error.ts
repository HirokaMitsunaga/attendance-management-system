export abstract class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly errorCode?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toResponse() {
    return {
      statusCode: this.statusCode,
      errorCode: this.errorCode ?? this.constructor.name,
      message: this.message,
    };
  }
}
