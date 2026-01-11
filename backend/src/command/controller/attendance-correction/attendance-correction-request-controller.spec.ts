import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ulid } from 'ulid';
import { AppModule } from 'src/app.module';
import { GlobalExceptionFilter } from 'src/common/filters/global-exception.filter';
import { parseISOString } from 'src/common/utils/date.utils';
import { CustomLoggerService } from 'src/config/custom-logger.service';
import { PrismaService } from 'src/prisma/prisma.service';

const describeDb = process.env.RUN_DB_TESTS === '1' ? describe : describe.skip;

describeDb('AttendanceCorrectionRequestController (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let httpServer: unknown;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // 本番と同じレスポンス形に寄せる
    const logger = app.get(CustomLoggerService);
    app.useGlobalFilters(new GlobalExceptionFilter(logger));

    await app.init();

    prisma = app.get(PrismaService);
    httpServer = app.getHttpServer();
  });

  beforeEach(async () => {
    if (!prisma) return;
    // テスト前に必ずデータベースをクリーンアップ
    await prisma.attendanceCorrectionEvent.deleteMany();
    await prisma.attendanceCorrection.deleteMany();
    await prisma.attendanceRule.deleteMany();

    // 有効な勤怠ルールを作成（すべての打刻タイプに対応）
    await prisma.attendanceRule.createMany({
      data: [
        {
          id: ulid(),
          targets: ['CLOCK_IN'],
          type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
          setting: {
            type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
            latestClockInTime: '23:59',
          },
          enabled: true,
        },
        {
          id: ulid(),
          targets: ['CLOCK_OUT'],
          type: 'ALLOW_CLOCK_OUT_ONLY_AFTER_TIME',
          setting: {
            type: 'ALLOW_CLOCK_OUT_ONLY_AFTER_TIME',
            earliestClockOutTime: '00:00',
          },
          enabled: true,
        },
        {
          id: ulid(),
          targets: ['BREAK_START'],
          type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
          setting: {
            type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
            latestClockInTime: '23:59',
          },
          enabled: true,
        },
        {
          id: ulid(),
          targets: ['BREAK_END'],
          type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
          setting: {
            type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
            latestClockInTime: '23:59',
          },
          enabled: true,
        },
      ],
    });
  });

  afterEach(async () => {
    if (!prisma) return;
    // テスト後にも必ずクリーンアップ（並列実行や異常終了時の影響を低減）
    await prisma.attendanceCorrectionEvent.deleteMany();
    await prisma.attendanceCorrection.deleteMany();
    await prisma.attendanceRule.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('正常系: request/clock-inで勤怠修正申請（REQUESTEDイベント）が作成される', async () => {
    const userId = ulid();
    const workDateIso = '2026-01-10T00:00:00.000Z';
    const occurredAtIso = '2026-01-10T09:00:00.000Z';
    const reason = '打刻漏れのため';

    await request(httpServer as never)
      .post('/attendance-correction/request/clock-in')
      .set('x-user-id', userId)
      .send({
        workDate: workDateIso,
        occurredAt: occurredAtIso,
        reason,
      })
      .expect(200);

    const correction = await prisma.attendanceCorrection.findUnique({
      where: {
        userId_workDate: {
          userId,
          workDate: parseISOString(workDateIso),
        },
      },
      include: {
        events: { orderBy: { createdAt: 'asc' } },
      },
    });

    expect(correction).not.toBeNull();
    expect(correction?.userId).toBe(userId);
    expect(correction?.workDate.toISOString()).toBe(workDateIso);
    expect(correction?.reason).toBe(reason);
    expect(correction?.events).toHaveLength(1);
    expect(correction?.events[0].type).toBe('REQUESTED');
    expect(correction?.events[0].actorUserId).toBe(userId);
    expect(correction?.events[0].reason).toBe(reason);

    const punches: unknown = correction?.events[0].punches;
    expect(punches).toEqual([
      {
        punchType: 'CLOCK_IN',
        occurredAt: occurredAtIso,
      },
    ]);
  });

  it('正常系: request/clock-outで勤怠修正申請（REQUESTEDイベント）が作成される', async () => {
    const userId = ulid();
    const workDateIso = '2026-01-11T00:00:00.000Z';
    const occurredAtIso = '2026-01-11T18:00:00.000Z';
    const reason = '退勤打刻を忘れたため';

    await request(httpServer as never)
      .post('/attendance-correction/request/clock-out')
      .set('x-user-id', userId)
      .send({
        workDate: workDateIso,
        occurredAt: occurredAtIso,
        reason,
      })
      .expect(200);

    const correction = await prisma.attendanceCorrection.findUnique({
      where: {
        userId_workDate: {
          userId,
          workDate: parseISOString(workDateIso),
        },
      },
      include: { events: { orderBy: { createdAt: 'asc' } } },
    });

    expect(correction).not.toBeNull();
    expect(correction?.events).toHaveLength(1);
    expect(correction?.events[0].type).toBe('REQUESTED');
    expect(correction?.events[0].actorUserId).toBe(userId);

    const punches: unknown = correction?.events[0].punches;
    expect(punches).toEqual([
      {
        punchType: 'CLOCK_OUT',
        occurredAt: occurredAtIso,
      },
    ]);
  });

  it('正常系: request/break-startで勤怠修正申請（REQUESTEDイベント）が作成される', async () => {
    const userId = ulid();
    const workDateIso = '2026-01-12T00:00:00.000Z';
    const occurredAtIso = '2026-01-12T12:00:00.000Z';
    const reason = '休憩開始の打刻漏れ';

    await request(httpServer as never)
      .post('/attendance-correction/request/break-start')
      .set('x-user-id', userId)
      .send({
        workDate: workDateIso,
        occurredAt: occurredAtIso,
        reason,
      })
      .expect(200);

    const correction = await prisma.attendanceCorrection.findUnique({
      where: {
        userId_workDate: {
          userId,
          workDate: parseISOString(workDateIso),
        },
      },
      include: { events: { orderBy: { createdAt: 'asc' } } },
    });

    expect(correction).not.toBeNull();
    expect(correction?.events).toHaveLength(1);
    expect(correction?.events[0].type).toBe('REQUESTED');
    expect(correction?.events[0].actorUserId).toBe(userId);

    const punches: unknown = correction?.events[0].punches;
    expect(punches).toEqual([
      {
        punchType: 'BREAK_START',
        occurredAt: occurredAtIso,
      },
    ]);
  });

  it('正常系: request/break-endで勤怠修正申請（REQUESTEDイベント）が作成される', async () => {
    const userId = ulid();
    const workDateIso = '2026-01-13T00:00:00.000Z';
    const occurredAtIso = '2026-01-13T13:00:00.000Z';
    const reason = '休憩終了の打刻漏れ';

    await request(httpServer as never)
      .post('/attendance-correction/request/break-end')
      .set('x-user-id', userId)
      .send({
        workDate: workDateIso,
        occurredAt: occurredAtIso,
        reason,
      })
      .expect(200);

    const correction = await prisma.attendanceCorrection.findUnique({
      where: {
        userId_workDate: {
          userId,
          workDate: parseISOString(workDateIso),
        },
      },
      include: { events: { orderBy: { createdAt: 'asc' } } },
    });

    expect(correction).not.toBeNull();
    expect(correction?.events).toHaveLength(1);
    expect(correction?.events[0].type).toBe('REQUESTED');
    expect(correction?.events[0].actorUserId).toBe(userId);

    const punches: unknown = correction?.events[0].punches;
    expect(punches).toEqual([
      {
        punchType: 'BREAK_END',
        occurredAt: occurredAtIso,
      },
    ]);
  });

  it('異常系: reasonが空文字の場合は400で返る', async () => {
    const userId = ulid();
    const workDateIso = '2026-01-14T00:00:00.000Z';
    const occurredAtIso = '2026-01-14T09:00:00.000Z';

    const res = await request(httpServer as never)
      .post('/attendance-correction/request/clock-in')
      .set('x-user-id', userId)
      .send({
        workDate: workDateIso,
        occurredAt: occurredAtIso,
        reason: '',
      })
      .expect(400);

    const body: unknown = res.body;
    expect(body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });

    expect(String((body as { message: unknown }).message)).toContain(
      'reason: 理由は必須です',
    );
  });

  it('異常系: 同一ユーザー・同一勤務日で既に勤怠修正申請がある場合は400で返る', async () => {
    const userId = ulid();
    const workDateIso = '2026-01-15T00:00:00.000Z';
    const occurredAtIso = '2026-01-15T09:00:00.000Z';
    const reason = '打刻漏れ';

    // 1回目
    await request(httpServer as never)
      .post('/attendance-correction/request/clock-in')
      .set('x-user-id', userId)
      .send({
        workDate: workDateIso,
        occurredAt: occurredAtIso,
        reason,
      })
      .expect(200);

    // 2回目（重複）
    const res = await request(httpServer as never)
      .post('/attendance-correction/request/clock-in')
      .set('x-user-id', userId)
      .send({
        workDate: workDateIso,
        occurredAt: occurredAtIso,
        reason,
      })
      .expect(400);

    const body: unknown = res.body;
    expect(body).toMatchObject({
      statusCode: 400,
      errorCode: 'DOMAIN_ERROR',
    });

    expect(String((body as { message: unknown }).message)).toContain(
      '既に勤怠修正申請が存在するため申請できません',
    );
  });
});
