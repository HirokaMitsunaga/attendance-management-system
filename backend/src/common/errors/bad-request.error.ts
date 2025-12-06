import { ApplicationError } from './application-error';

export class BadRequestError extends ApplicationError {
  constructor(message: string) {
    super(message, 400, 'BAD_REQUEST');
  }
}
