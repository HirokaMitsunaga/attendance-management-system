export type SearchConditionProps = {
  id?: string;
  formType: string;
  name: string;
  urlParams: string;
  createdAt?: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy: string;
  deletedAt?: Date | null;
  deletedBy?: string | null;
};

export class SearchConditionEntity {
  private constructor(private props: SearchConditionProps) {}

  static createNew({
    formType,
    name,
    urlParams,
    userId,
  }: {
    formType: string;
    name: string;
    urlParams: string;
    userId: string;
  }): SearchConditionEntity {
    return new SearchConditionEntity({
      formType,
      name,
      urlParams,
      createdBy: userId,
      updatedBy: userId,
      deletedAt: null,
      deletedBy: null,
    });
  }

  static reconstruct(props: SearchConditionProps): SearchConditionEntity {
    return new SearchConditionEntity(props);
  }

  get id(): string {
    if (!this.props.id) {
      throw new Error('ID is not set');
    }
    return this.props.id;
  }

  get formType(): string {
    return this.props.formType;
  }

  get name(): string {
    return this.props.name;
  }

  get urlParams(): string {
    return this.props.urlParams;
  }

  get createdAt(): Date {
    if (!this.props.createdAt) {
      throw new Error('createdAt is not set');
    }
    return this.props.createdAt;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get updatedAt(): Date {
    if (!this.props.updatedAt) {
      throw new Error('updatedAt is not set');
    }
    return this.props.updatedAt;
  }

  get updatedBy(): string {
    return this.props.updatedBy;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt ?? null;
  }

  get deletedBy(): string | null {
    return this.props.deletedBy ?? null;
  }

  changeName(name: string, userId: string): void {
    this.props.name = name;
    this.props.updatedBy = userId;
    this.touch(userId);
  }

  delete(userId: string, deletedAt: Date): void {
    this.props.deletedAt = deletedAt;
    this.props.deletedBy = userId;
    this.touch(userId);
  }

  toPrimitives(): {
    id: string;
    formType: string;
    name: string;
    urlParams: string;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    deletedAt: Date | null;
    deletedBy: string | null;
  } {
    return {
      id: this.id,
      formType: this.formType,
      name: this.name,
      urlParams: this.urlParams,
      createdAt: this.createdAt,
      createdBy: this.createdBy,
      updatedAt: this.updatedAt,
      updatedBy: this.updatedBy,
      deletedAt: this.deletedAt,
      deletedBy: this.deletedBy,
    };
  }

  private touch(userId: string): void {
    this.props.updatedAt = new Date();
    this.props.updatedBy = userId;
  }
}
