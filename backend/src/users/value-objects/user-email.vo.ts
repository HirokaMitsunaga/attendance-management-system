import { DomainError } from '../../common/errors/domain.error';
import { INVALID, REQUIRED_FIELD } from '../../common/constants';

export class UserEmail {
  private constructor(public readonly value: string) {}

  static create(email: string): UserEmail {
    const trimmed = email.trim();

    if (!trimmed) {
      throw new DomainError(REQUIRED_FIELD('メールアドレス'));
    }

    if (!trimmed.includes('@')) {
      throw new DomainError(INVALID.EMAIL_FORMAT);
    }

    return new UserEmail(trimmed.toLowerCase());
  }
}
