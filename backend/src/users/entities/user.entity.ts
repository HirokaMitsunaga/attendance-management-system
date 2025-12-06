import type { Gender, UserRole } from '@prisma/client';
import { UserName } from '../value-objects/user-name.vo';
import { UserEmail } from '../value-objects/user-email.vo';
import type { UserResponseDto } from '../dto/user-response.dto';

export type UserProps = {
  id?: string;
  email: UserEmail;
  role: UserRole;
  name: UserName;
  gender: Gender | null;
  createdAt?: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy: string;
  deletedAt?: Date | null;
  deletedBy?: string | null;
};

export class UserEntity {
  private constructor(private readonly props: UserProps) {}

  static createNew(params: {
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    gender: Gender | null;
    userId: string;
  }): UserEntity {
    return new UserEntity({
      email: UserEmail.create(params.email),
      role: params.role,
      name: UserName.create({
        firstName: params.firstName,
        lastName: params.lastName,
      }),
      gender: params.gender,
      createdBy: params.userId,
      updatedBy: params.userId,
      deletedAt: null,
      deletedBy: null,
    });
  }

  static reconstruct(props: UserProps): UserEntity {
    return new UserEntity(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get email(): string {
    return this.props.email.value;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get firstName(): string {
    return this.props.name.firstName;
  }

  get lastName(): string {
    return this.props.name.lastName;
  }

  get fullName(): string {
    return this.props.name.fullName;
  }

  get gender(): Gender | null {
    return this.props.gender;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get deletedAt(): Date | null | undefined {
    return this.props.deletedAt;
  }

  changeName(firstName: string, lastName: string, userId: string): void {
    this.props.name = UserName.create({ firstName, lastName });
    this.touch(userId);
  }

  changeEmail(email: string, userId: string): void {
    this.props.email = UserEmail.create(email);
    this.touch(userId);
  }

  changeRole(role: UserRole, userId: string): void {
    this.props.role = role;
    this.touch(userId);
  }

  changeGender(gender: Gender | null, userId: string): void {
    this.props.gender = gender;
    this.touch(userId);
  }

  delete(userId: string, deletedAt: Date): void {
    this.props.deletedAt = deletedAt;
    this.props.deletedBy = userId;
    this.touch(userId);
  }

  toPrimitives(): UserResponseDto {
    return {
      id: this.props.id,
      email: this.email,
      role: this.role,
      firstName: this.firstName,
      lastName: this.lastName,
      gender: this.gender,
      createdAt: this.props.createdAt,
      createdBy: this.props.createdBy,
      updatedAt: this.props.updatedAt,
      updatedBy: this.props.updatedBy,
      deletedAt: this.props.deletedAt,
      deletedBy: this.props.deletedBy,
    };
  }

  private touch(userId: string): void {
    this.props.updatedAt = new Date();
    this.props.updatedBy = userId;
  }
}
