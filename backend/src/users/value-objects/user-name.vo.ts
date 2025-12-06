import { DomainError } from '../../common/errors/domain.error';
import { REQUIRED_FIELD } from '../../common/constants';

export class UserName {
  private constructor(
    public readonly firstName: string,
    public readonly lastName: string,
  ) {}

  static create(props: { firstName: string; lastName: string }): UserName {
    const trimmedFirst = props.firstName.trim();
    const trimmedLast = props.lastName.trim();

    if (!trimmedFirst || !trimmedLast) {
      throw new DomainError(REQUIRED_FIELD('姓・名'));
    }

    return new UserName(trimmedFirst, trimmedLast);
  }

  get fullName(): string {
    return `${this.lastName} ${this.firstName}`;
  }
}
