import { PunchType } from './punch-type';

/*
勤怠(Punch)はドメインイベントとして扱うため、書き込みのみ行い更新はしない。
*/
//TODO:日を跨ぐ際にどのように登録するのか決める

type PunchVOParams = {
  punchType: PunchType;
  occurredAt: Date;
  createdAt?: Date;
};

export class PunchVO {
  private readonly punchType: PunchType;
  private readonly occurredAt: Date; // 実際に起きた時刻（アプリ側の時刻でOK）
  private readonly createdAt?: Date; //最新の勤怠のイベントを算出する際に使う(DB保存時の時刻にする)

  private constructor({ punchType, occurredAt, createdAt }: PunchVOParams) {
    this.punchType = punchType;
    this.occurredAt = occurredAt;
    this.createdAt = createdAt;
  }

  public static create({
    punchType,
    occurredAt,
  }: Omit<PunchVOParams, 'created_at'>): PunchVO {
    return new PunchVO({ punchType, occurredAt });
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
}
