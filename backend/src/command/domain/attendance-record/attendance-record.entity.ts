import { ATTENDANCE_STATUS, AttendanceStatus } from './attendance-status';
import { EntityId } from '../entity-id.vo';
import { PUNCH_TYPE, PunchType } from '../common/punch/punch-type';
import { PunchEvent } from '../common/punch/punch-event.vo';
import { InvalidAttendanceRecordStateError } from './attendance-record.error';
import { PUNCH_SOURCE } from '../common/punch/punch-source';

type AttendanceRecordParams = {
  id: EntityId;
  userId: EntityId;
  workDate: Date;
  punchEvents: PunchEvent[];
};

// エンティティ（集約ルート）：AttendanceRecord
export class AttendanceRecord {
  // --- Identity ---
  private readonly id: EntityId;

  // --- Ownership / Scope ---
  private readonly userId: EntityId;
  private readonly workDate: Date; // その日の勤怠

  // 修正申請は別集約なので、ここは事実ログのまま
  private punchEvents: PunchEvent[];

  private constructor({
    id,
    userId,
    workDate,
    punchEvents,
  }: AttendanceRecordParams) {
    this.id = id;
    this.userId = userId;
    this.workDate = workDate;
    this.punchEvents = punchEvents;
  }

  public static create({
    userId,
    workDate,
    punchEvents,
  }: Omit<AttendanceRecordParams, 'id'>) {
    return new AttendanceRecord({
      id: EntityId.generate(),
      userId,
      workDate,
      punchEvents,
    });
  }

  public static reconstruct({
    id,
    userId,
    workDate,
    punchEvents,
  }: AttendanceRecordParams) {
    return new AttendanceRecord({
      id,
      userId,
      workDate,
      punchEvents,
    });
  }

  public clockIn({ occurredAt }: { occurredAt: Date }) {
    const currentStatus = this.latestWorkStatus();
    if (!this.canClockIn()) {
      throw new InvalidAttendanceRecordStateError({
        operation: '出勤',
        currentStatus,
      });
    }

    const punch = PunchEvent.create({
      punchType: PUNCH_TYPE.CLOCK_IN,
      occurredAt,
      source: PUNCH_SOURCE.NORMAL,
    });
    this.punchEvents.push(punch);
  }

  public clockOut({ occurredAt }: { occurredAt: Date }) {
    const currentStatus = this.latestWorkStatus();
    if (!this.canClockOut()) {
      throw new InvalidAttendanceRecordStateError({
        operation: '退勤',
        currentStatus,
      });
    }

    const punch = PunchEvent.create({
      punchType: PUNCH_TYPE.CLOCK_OUT,
      occurredAt,
      source: PUNCH_SOURCE.NORMAL,
    });
    this.punchEvents.push(punch);
  }

  public breakStart({ occurredAt }: { occurredAt: Date }) {
    const currentStatus = this.latestWorkStatus();
    if (!this.canBreakStart()) {
      throw new InvalidAttendanceRecordStateError({
        operation: '休憩の開始',
        currentStatus,
      });
    }

    const punch = PunchEvent.create({
      punchType: PUNCH_TYPE.BREAK_START,
      occurredAt,
      source: PUNCH_SOURCE.NORMAL,
    });
    this.punchEvents.push(punch);
  }
  public breakEnd({ occurredAt }: { occurredAt: Date }) {
    const currentStatus = this.latestWorkStatus();
    if (!this.canBreakEnd()) {
      throw new InvalidAttendanceRecordStateError({
        operation: '休憩の終了',
        currentStatus,
      });
    }

    const punch = PunchEvent.create({
      punchType: PUNCH_TYPE.BREAK_END,
      occurredAt,
      source: PUNCH_SOURCE.NORMAL,
    });
    this.punchEvents.push(punch);
  }

  public canClockIn(): boolean {
    return this.latestWorkStatus() === ATTENDANCE_STATUS.NOT_STARTED;
  }

  public canBreakStart(): boolean {
    return this.latestWorkStatus() === ATTENDANCE_STATUS.WORKING;
  }

  public canBreakEnd(): boolean {
    return this.latestWorkStatus() === ATTENDANCE_STATUS.BREAKING;
  }

  public canClockOut(): boolean {
    return this.latestWorkStatus() === ATTENDANCE_STATUS.WORKING;
  }

  //該当日付の中で一番最新の勤怠イベントを取得して現在の状態を返す関数
  private latestWorkStatus(): AttendanceStatus {
    // 該当日付の勤怠のみに絞る
    const sortedPunchEvents = [...this.punchEvents]
      .filter((punch) => this.isSameDate(punch.getOccurredAt(), this.workDate))
      .sort(
        (a, b) => b.getOccurredAt().getTime() - a.getOccurredAt().getTime(),
      );

    //punch(勤怠)がない場合は勤務開始してない
    if (sortedPunchEvents.length === 0) {
      return ATTENDANCE_STATUS.NOT_STARTED;
    }

    const latestPunchType = sortedPunchEvents[0].getPunchType();

    const punchTypeToStatusMap: Record<PunchType, AttendanceStatus> = {
      [PUNCH_TYPE.CLOCK_IN]: ATTENDANCE_STATUS.WORKING,
      [PUNCH_TYPE.CLOCK_OUT]: ATTENDANCE_STATUS.FINISHED,
      [PUNCH_TYPE.BREAK_START]: ATTENDANCE_STATUS.BREAKING,
      [PUNCH_TYPE.BREAK_END]: ATTENDANCE_STATUS.WORKING,
    };

    return punchTypeToStatusMap[latestPunchType];
  }

  //日付が同じかどうかを判定する関数
  private isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  public getId(): string {
    return this.id.getEntityId();
  }
  public getUserId(): string {
    return this.userId.getEntityId();
  }
  public getWorkDate(): Date {
    return this.workDate;
  }
  public getPunchEvents(): PunchEvent[] {
    return this.punchEvents;
  }
}
