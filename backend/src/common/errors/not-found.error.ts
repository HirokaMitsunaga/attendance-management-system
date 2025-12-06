import { ApplicationError } from './application-error';
import { getResourceNotFound } from '../constants';

export class NotFoundError extends ApplicationError {
  constructor(resource: string, identifier?: string | number) {
    const message = getResourceNotFound(resource, identifier);
    super(message, 404, 'NOT_FOUND');
  }
}
