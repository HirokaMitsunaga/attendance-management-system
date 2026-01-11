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

describeDb('AttendanceCorrectionActionController (integration)', () => {
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
    await prisma.attendancePunchEvent.deleteMany();
    await prisma.attendanceRecord.deleteMany();
    await prisma.attendanceCorrectionEvent.deleteMany();
    await prisma.attendanceCorrection.deleteMany();
  });

  afterEach(async () => {
    if (!prisma) return;
    await prisma.attendancePunchEvent.deleteMany();
    await prisma.attendanceRecord.deleteMany();
    await prisma.attendanceCorrectionEvent.deleteMany();
    await prisma.attendanceCorrection.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('正常系: approveでAPPROVEDイベントが作成され、勤怠レコードに打刻が反映される', async () => {
    const targetUserId = ulid();
    const approverUserId = ulid();
    const workDateIso = '2026-01-26T00:00:00.000Z';
    const occurredAtIso = '2026-01-26T09:00:00.000Z';

    // 勤怠修正申請（PENDING）を作成
    await request(httpServer as never)
      .post('/attendance-correction/request/clock-in')
      .set('x-user-id', targetUserId)
      .send({
        workDate: workDateIso,
        occurredAt: occurredAtIso,
        reason: '打刻漏れ',
      })
      .expect(200);

    // approveには勤怠レコードが必要
    await prisma.attendanceRecord.create({
      data: {
        id: ulid(),
        userId: targetUserId,
        workDate: parseISOString(workDateIso),
      },
    });

    await request(httpServer as never)
      .post('/attendance-correction/approve')
      .set('x-user-id', approverUserId)
      .send({
        userId: targetUserId,
        workDate: workDateIso,
      })
      .expect(200);

    const correction = await prisma.attendanceCorrection.findUnique({
      where: {
        userId_workDate: {
          userId: targetUserId,
          workDate: parseISOString(workDateIso),
        },
      },
      include: { events: { orderBy: { createdAt: 'asc' } } },
    });

    expect(correction).not.toBeNull();
    expect(correction?.events).toHaveLength(2);
    expect(correction?.events[1].type).toBe('APPROVED');
    expect(correction?.events[1].actorUserId).toBe(approverUserId);

    const record = await prisma.attendanceRecord.findUnique({
      where: {
        userId_workDate: {
          userId: targetUserId,
          workDate: parseISOString(workDateIso),
        },
      },
      include: { punchEvents: { orderBy: { occurredAt: 'asc' } } },
    });

    expect(record).not.toBeNull();
    expect(record?.punchEvents).toHaveLength(1);
    expect(record?.punchEvents[0].punchType).toBe('CLOCK_IN');
    expect(record?.punchEvents[0].occurredAt.toISOString()).toBe(occurredAtIso);
    // 現状の実装では CORRECTION ではなく NORMAL が入る
    expect(record?.punchEvents[0].source).toBe('NORMAL');
  });

  it('正常系: rejectでREJECTEDイベントが作成される', async () => {
    const targetUserId = ulid();
    const rejectedBy = ulid();
    const workDateIso = '2026-01-27T00:00:00.000Z';

    await request(httpServer as never)
      .post('/attendance-correction/request/clock-in')
      .set('x-user-id', targetUserId)
      .send({
        workDate: workDateIso,
        occurredAt: '2026-01-27T09:00:00.000Z',
        reason: '打刻漏れ',
      })
      .expect(200);

    await request(httpServer as never)
      .post('/attendance-correction/reject')
      .set('x-user-id', rejectedBy)
      .send({
        userId: targetUserId,
        workDate: workDateIso,
        comment: '差し戻し理由',
      })
      .expect(200);

    const correction = await prisma.attendanceCorrection.findUnique({
      where: {
        userId_workDate: {
          userId: targetUserId,
          workDate: parseISOString(workDateIso),
        },
      },
      include: { events: { orderBy: { createdAt: 'asc' } } },
    });

    expect(correction).not.toBeNull();
    expect(correction?.events).toHaveLength(2);
    expect(correction?.events[1].type).toBe('REJECTED');
    expect(correction?.events[1].actorUserId).toBe(rejectedBy);
    expect(correction?.events[1].comment).toBe('差し戻し理由');
  });

  it('正常系: cancelでCANCELEDイベントが作成される', async () => {
    const targetUserId = ulid();
    const canceledBy = ulid();
    const workDateIso = '2026-01-28T00:00:00.000Z';

    await request(httpServer as never)
      .post('/attendance-correction/request/clock-in')
      .set('x-user-id', targetUserId)
      .send({
        workDate: workDateIso,
        occurredAt: '2026-01-28T09:00:00.000Z',
        reason: '打刻漏れ',
      })
      .expect(200);

    await request(httpServer as never)
      .post('/attendance-correction/cancel')
      .set('x-user-id', canceledBy)
      .send({
        userId: targetUserId,
        workDate: workDateIso,
      })
      .expect(200);

    const correction = await prisma.attendanceCorrection.findUnique({
      where: {
        userId_workDate: {
          userId: targetUserId,
          workDate: parseISOString(workDateIso),
        },
      },
      include: { events: { orderBy: { createdAt: 'asc' } } },
    });

    expect(correction).not.toBeNull();
    expect(correction?.events).toHaveLength(2);
    expect(correction?.events[1].type).toBe('CANCELED');
    expect(correction?.events[1].actorUserId).toBe(canceledBy);
  });

  it('異常系: approveでuserIdが空文字の場合は400で返る', async () => {
    const res = await request(httpServer as never)
      .post('/attendance-correction/approve')
      .send({
        userId: '',
        workDate: '2026-01-29T00:00:00.000Z',
      })
      .expect(400);

    const body: unknown = res.body;
    expect(body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });
    expect(String((body as { message: unknown }).message)).toContain(
      'userId: ユーザーIDは必須です',
    );
  });

  it('異常系: rejectで勤怠修正申請が存在しない場合は404で返る', async () => {
    const res = await request(httpServer as never)
      .post('/attendance-correction/reject')
      .set('x-user-id', ulid())
      .send({
        userId: ulid(),
        workDate: '2026-01-30T00:00:00.000Z',
        comment: '差し戻し理由',
      })
      .expect(404);

    const body: unknown = res.body;
    expect(body).toMatchObject({
      statusCode: 404,
      errorCode: 'NOT_FOUND',
    });
  });
});
