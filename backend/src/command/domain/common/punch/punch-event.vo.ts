import { EntityId } from '../../entity-id.vo';
import { PunchType } from './punch-type';
import { PUNCH_SOURCE, PunchSource } from './punch-source';
import { DomainError } from '../../../../common/errors/domain.error';

/**
 * 勤怠（PunchEvent）は「勤務タイムラインの事実イベント」を表す Value Object。
 *
 * - append-only（更新しない前提）
 * - すべてのイベントが共通の構造を持つため VO（クラス）で表現する
 * - source/sourceId の整合性（NORMAL/CORRECTION）を不変条件として保証する
 */
//TODO:日を跨ぐ際にどのように登録するのか決める

type PunchEventParams = {
  punchType: PunchType;
  occurredAt: Date;
  createdAt?: Date;
  source: PunchSource;
  sourceId?: EntityId;
};

export class PunchEvent {
  private readonly punchType: PunchType;
  private readonly occurredAt: Date; // 実際に起きた時刻（アプリ側の時刻でOK）
  private readonly createdAt?: Date; //最新の勤怠のイベントを算出する際に使う(DB保存時の時刻にする)
  private readonly source: PunchSource; //通常の勤怠なのか、修正の勤怠なのか
  private readonly sourceId?: EntityId; //勤怠修正のID(冪等性確保のため追加)

  private constructor({
    punchType,
    occurredAt,
    createdAt,
    source,
    sourceId,
  }: PunchEventParams) {
    if (source === PUNCH_SOURCE.CORRECTION && !sourceId) {
      throw new DomainError('修正打刻にはsourceIdが必要です');
    }
    if (source === PUNCH_SOURCE.NORMAL && sourceId) {
      throw new DomainError('通常打刻にはsourceIdを指定できません');
    }
    this.punchType = punchType;
    this.occurredAt = occurredAt;
    this.createdAt = createdAt;
    this.source = source;
    this.sourceId = sourceId;
  }

  public static create(params: {
    punchType: PunchType;
    occurredAt: Date;
    source?: PunchSource;
    sourceId?: EntityId;
  }): PunchEvent {
    return new PunchEvent({
      punchType: params.punchType,
      occurredAt: params.occurredAt,
      source: params.source ?? PUNCH_SOURCE.NORMAL,
      sourceId: params.sourceId,
    });
  }

  public static reconstruct({
    punchType,
    occurredAt,
    createdAt,
    source,
    sourceId,
  }: PunchEventParams): PunchEvent {
    return new PunchEvent({
      punchType,
      occurredAt,
      createdAt,
      source,
      sourceId,
    });
  }

  public getPunchType(): PunchType {
    return this.punchType;
  }

  public getOccurredAt(): Date {
    return this.occurredAt;
  }

  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  public getSource(): PunchSource {
    return this.source;
  }

  public getSourceId(): string | undefined {
    if (!this.sourceId) {
      return undefined;
    }
    return this.sourceId.getEntityId();
  }
}
