import { DomainError } from '../../common/errors/domain.error';
import { isValid, ulid } from 'ulid';

export class EntityId {
  private readonly entityId: string;

  private constructor({ entityId }: { entityId: string }) {
    if (!isValid(entityId)) {
      throw new DomainError(`無効なID形式です:${entityId}`);
    }
    this.entityId = entityId;
  }

  //新規生成時
  public static generate(): EntityId {
    return new EntityId({ entityId: ulid() });
  }

  //バリデーション付きの作成
  public static create({ entityId }: { entityId: string }): EntityId {
    return new EntityId({ entityId });
  }

  //DB取得時
  public static reconstruct({ entityId }: { entityId: string }): EntityId {
    return new EntityId({ entityId });
  }

  public getEntityId(): string {
    return this.entityId;
  }
}
