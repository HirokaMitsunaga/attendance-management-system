import { ApplicationError } from './application-error';

/**
 * ドメイン層のエラー
 * ビジネスルール違反や不変条件違反を表す
 */
export class DomainError extends ApplicationError {
  constructor(message: string) {
    super(message, 400, 'DOMAIN_ERROR');
  }
}
