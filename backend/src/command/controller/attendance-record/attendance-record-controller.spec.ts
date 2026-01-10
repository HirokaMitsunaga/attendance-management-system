import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ulid } from 'ulid';
import { AppModule } from 'src/app.module';
import { GlobalExceptionFilter } from 'src/common/filters/global-exception.filter';
import { CustomLoggerService } from 'src/config/custom-logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { parseISOString } from 'src/common/utils/date.utils';

const describeDb = process.env.RUN_DB_TESTS === '1' ? describe : describe.skip;

describeDb('AttendanceRecordController (integration)', () => {
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
    await prisma.attendancePunchEvent.deleteMany();
    await prisma.attendanceRecord.deleteMany();
  });

  afterEach(async () => {
    if (!prisma) return;
    // テスト後にも必ずクリーンアップ（並列実行や異常終了時の影響を低減）
    await prisma.attendancePunchEvent.deleteMany();
    await prisma.attendanceRecord.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('正常系: clock-inで勤怠レコードと打刻イベントが作成される', async () => {
    const userId = ulid();
    const workDateIso = '2026-01-10T00:00:00.000Z';
    const occurredAtIso = '2026-01-10T09:00:00.000Z';

    // supertest の型定義が厳密なため、httpServer を never にキャスト
    await request(httpServer as never)
      .post('/attendance-record/clock-in')
      .send({
        userId,
        workDate: workDateIso,
        occurredAt: occurredAtIso,
      })
      .expect(200);

    const record = await prisma.attendanceRecord.findUnique({
      where: {
        userId_workDate: {
          userId,
          workDate: parseISOString(workDateIso),
        },
      },
      include: {
        punchEvents: {
          orderBy: { occurredAt: 'asc' },
        },
      },
    });

    expect(record).not.toBeNull();
    expect(record?.userId).toBe(userId);
    expect(record?.workDate.toISOString()).toBe(workDateIso);
    expect(record?.punchEvents).toHaveLength(1);
    expect(record?.punchEvents[0].punchType).toBe('CLOCK_IN');
    expect(record?.punchEvents[0].occurredAt.toISOString()).toBe(occurredAtIso);
    expect(record?.punchEvents[0].source).toBe('NORMAL');
  });

  it('正常系: 既存勤怠レコードがある場合でもイベントが追加される', async () => {
    const userId = ulid();
    const workDateIso = '2026-01-11T00:00:00.000Z';
    const occurredAtIso = '2026-01-11T09:00:00.000Z';
    const existingRecordId = ulid();

    await prisma.attendanceRecord.create({
      data: {
        id: existingRecordId,
        userId,
        workDate: parseISOString(workDateIso),
      },
    });

    // supertest の型定義が厳密なため、httpServer を never にキャスト
    await request(httpServer as never)
      .post('/attendance-record/clock-in')
      .send({
        userId,
        workDate: workDateIso,
        occurredAt: occurredAtIso,
      })
      .expect(200);

    const record = await prisma.attendanceRecord.findUnique({
      where: {
        userId_workDate: {
          userId,
          workDate: parseISOString(workDateIso),
        },
      },
      include: {
        punchEvents: {
          orderBy: { occurredAt: 'asc' },
        },
      },
    });

    expect(record).not.toBeNull();
    expect(record?.id).toBe(existingRecordId);
    expect(record?.punchEvents).toHaveLength(1);
    expect(record?.punchEvents[0].punchType).toBe('CLOCK_IN');
  });

  it('異常系: userIdが空文字の場合は400で返る', async () => {
    const workDateIso = '2026-01-12T00:00:00.000Z';
    const occurredAtIso = '2026-01-12T09:00:00.000Z';

    // supertest の型定義が厳密なため、httpServer を never にキャスト
    const res = await request(httpServer as never)
      .post('/attendance-record/clock-in')
      .send({
        userId: '',
        workDate: workDateIso,
        occurredAt: occurredAtIso,
      })
      .expect(400);

    const body: unknown = res.body;
    expect(body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });

    if (typeof body !== 'object' || body === null || !('message' in body)) {
      throw new Error('レスポンスボディに message がありません');
    }
    expect(String((body as { message: unknown }).message)).toContain(
      'userId: ユーザーIDは必須です',
    );
  });

  it('正常系: clock-outで退勤の打刻イベントが追加される', async () => {
    const userId = ulid();
    const workDateIso = '2026-01-13T00:00:00.000Z';
    const clockInOccurredAtIso = '2026-01-13T09:00:00.000Z';
    const clockOutOccurredAtIso = '2026-01-13T18:00:00.000Z';
    const recordId = ulid();

    // 出勤記録を事前に作成
    await prisma.attendanceRecord.create({
      data: {
        id: recordId,
        userId,
        workDate: parseISOString(workDateIso),
        punchEvents: {
          create: {
            id: ulid(),
            punchType: 'CLOCK_IN',
            occurredAt: parseISOString(clockInOccurredAtIso),
            source: 'NORMAL',
          },
        },
      },
    });

    // supertest の型定義が厳密なため、httpServer を never にキャスト
    await request(httpServer as never)
      .post('/attendance-record/clock-out')
      .send({
        userId,
        workDate: workDateIso,
        occurredAt: clockOutOccurredAtIso,
      })
      .expect(200);

    const record = await prisma.attendanceRecord.findUnique({
      where: {
        userId_workDate: {
          userId,
          workDate: parseISOString(workDateIso),
        },
      },
      include: {
        punchEvents: {
          orderBy: { occurredAt: 'asc' },
        },
      },
    });

    expect(record).not.toBeNull();
    expect(record?.userId).toBe(userId);
    expect(record?.workDate.toISOString()).toBe(workDateIso);
    expect(record?.punchEvents).toHaveLength(2);
    expect(record?.punchEvents[0].punchType).toBe('CLOCK_IN');
    expect(record?.punchEvents[0].occurredAt.toISOString()).toBe(
      clockInOccurredAtIso,
    );
    expect(record?.punchEvents[1].punchType).toBe('CLOCK_OUT');
    expect(record?.punchEvents[1].occurredAt.toISOString()).toBe(
      clockOutOccurredAtIso,
    );
    expect(record?.punchEvents[1].source).toBe('NORMAL');
  });

  it('異常系: clock-outで出勤記録が存在しない場合は404で返る', async () => {
    const userId = ulid();
    const workDateIso = '2026-01-14T00:00:00.000Z';
    const occurredAtIso = '2026-01-14T18:00:00.000Z';

    // supertest の型定義が厳密なため、httpServer を never にキャスト
    const res = await request(httpServer as never)
      .post('/attendance-record/clock-out')
      .send({
        userId,
        workDate: workDateIso,
        occurredAt: occurredAtIso,
      })
      .expect(404);

    const body: unknown = res.body;
    expect(body).toMatchObject({
      statusCode: 404,
    });

    if (typeof body !== 'object' || body === null || !('message' in body)) {
      throw new Error('レスポンスボディに message がありません');
    }
    expect(String((body as { message: unknown }).message)).toContain(
      '勤怠記録',
    );
  });

  it('異常系: clock-outでuserIdが空文字の場合は400で返る', async () => {
    const workDateIso = '2026-01-15T00:00:00.000Z';
    const occurredAtIso = '2026-01-15T18:00:00.000Z';

    // supertest の型定義が厳密なため、httpServer を never にキャスト
    const res = await request(httpServer as never)
      .post('/attendance-record/clock-out')
      .send({
        userId: '',
        workDate: workDateIso,
        occurredAt: occurredAtIso,
      })
      .expect(400);

    const body: unknown = res.body;
    expect(body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });

    if (typeof body !== 'object' || body === null || !('message' in body)) {
      throw new Error('レスポンスボディに message がありません');
    }
    expect(String((body as { message: unknown }).message)).toContain(
      'userId: ユーザーIDは必須です',
    );
  });
});
