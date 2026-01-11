import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import request from 'supertest';
import { ulid } from 'ulid';
import { AppModule } from 'src/app.module';
import { GlobalExceptionFilter } from 'src/common/filters/global-exception.filter';
import { parseISOString } from 'src/common/utils/date.utils';
import { CustomLoggerService } from 'src/config/custom-logger.service';
import { PrismaService } from 'src/prisma/prisma.service';

const describeDb = process.env.RUN_DB_TESTS === '1' ? describe : describe.skip;

describeDb('AttendanceCorrectionResubmitController (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let httpServer: unknown;

  const seedRejectedCorrection = async (params: {
    userId: string;
    workDateIso: string;
    initialReason: string;
    initialPunchType: 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END';
    initialOccurredAtIso: string;
  }) => {
    const correctionId = ulid();
    const rejectedBy = ulid();

    await prisma.attendanceCorrection.create({
      data: {
        id: correctionId,
        userId: params.userId,
        workDate: parseISOString(params.workDateIso),
        reason: params.initialReason,
        events: {
          create: [
            {
              id: ulid(),
              type: 'REQUESTED',
              occurredAt: parseISOString(params.workDateIso),
              actorUserId: params.userId,
              reason: params.initialReason,
              comment: null,
              punches: [
                {
                  punchType: params.initialPunchType,
                  occurredAt: params.initialOccurredAtIso,
                },
              ],
            },
            {
              id: ulid(),
              type: 'REJECTED',
              occurredAt: parseISOString(params.workDateIso),
              actorUserId: rejectedBy,
              reason: null,
              comment: '差し戻し',
              punches: Prisma.DbNull,
            },
          ],
        },
      },
    });
  };

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
    await prisma.attendanceCorrectionEvent.deleteMany();
    await prisma.attendanceCorrection.deleteMany();
  });

  afterEach(async () => {
    if (!prisma) return;
    await prisma.attendanceCorrectionEvent.deleteMany();
    await prisma.attendanceCorrection.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('正常系: resubmit/clock-inでREQUESTEDイベントが追加される', async () => {
    const userId = ulid();
    const workDateIso = '2026-01-20T00:00:00.000Z';
    const occurredAtIso = '2026-01-20T09:00:00.000Z';
    const initialReason = '初回申請理由';
    const resubmitReason = '再申請理由';

    await seedRejectedCorrection({
      userId,
      workDateIso,
      initialReason,
      initialPunchType: 'CLOCK_OUT',
      initialOccurredAtIso: '2026-01-20T18:00:00.000Z',
    });

    await request(httpServer as never)
      .post('/attendance-correction/resubmit/clock-in')
      .set('x-user-id', userId)
      .send({
        workDate: workDateIso,
        occurredAt: occurredAtIso,
        reason: resubmitReason,
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
    expect(correction?.events).toHaveLength(3);
    // entity.reason は更新されない設計なので初回のまま
    expect(correction?.reason).toBe(initialReason);

    const latest = correction?.events[2];
    expect(latest?.type).toBe('REQUESTED');
    expect(latest?.actorUserId).toBe(userId);
    expect(latest?.reason).toBe(resubmitReason);
    expect(latest?.punches).toEqual([
      { punchType: 'CLOCK_IN', occurredAt: occurredAtIso },
    ]);
  });

  it('正常系: resubmit/clock-outでREQUESTEDイベントが追加される', async () => {
    const userId = ulid();
    const workDateIso = '2026-01-21T00:00:00.000Z';
    const occurredAtIso = '2026-01-21T18:00:00.000Z';

    await seedRejectedCorrection({
      userId,
      workDateIso,
      initialReason: '初回申請理由',
      initialPunchType: 'CLOCK_IN',
      initialOccurredAtIso: '2026-01-21T09:00:00.000Z',
    });

    await request(httpServer as never)
      .post('/attendance-correction/resubmit/clock-out')
      .set('x-user-id', userId)
      .send({
        workDate: workDateIso,
        occurredAt: occurredAtIso,
        reason: '再申請理由',
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
    expect(correction?.events).toHaveLength(3);

    const latest = correction?.events[2];
    expect(latest?.type).toBe('REQUESTED');
    expect(latest?.actorUserId).toBe(userId);
    expect(latest?.punches).toEqual([
      { punchType: 'CLOCK_OUT', occurredAt: occurredAtIso },
    ]);
  });

  it('正常系: resubmit/break-startでREQUESTEDイベントが追加される', async () => {
    const userId = ulid();
    const workDateIso = '2026-01-22T00:00:00.000Z';
    const occurredAtIso = '2026-01-22T12:00:00.000Z';

    await seedRejectedCorrection({
      userId,
      workDateIso,
      initialReason: '初回申請理由',
      initialPunchType: 'CLOCK_IN',
      initialOccurredAtIso: '2026-01-22T09:00:00.000Z',
    });

    await request(httpServer as never)
      .post('/attendance-correction/resubmit/break-start')
      .set('x-user-id', userId)
      .send({
        workDate: workDateIso,
        occurredAt: occurredAtIso,
        reason: '再申請理由',
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
    expect(correction?.events).toHaveLength(3);

    const latest = correction?.events[2];
    expect(latest?.type).toBe('REQUESTED');
    expect(latest?.actorUserId).toBe(userId);
    expect(latest?.punches).toEqual([
      { punchType: 'BREAK_START', occurredAt: occurredAtIso },
    ]);
  });

  it('正常系: resubmit/break-endでREQUESTEDイベントが追加される', async () => {
    const userId = ulid();
    const workDateIso = '2026-01-23T00:00:00.000Z';
    const occurredAtIso = '2026-01-23T13:00:00.000Z';

    await seedRejectedCorrection({
      userId,
      workDateIso,
      initialReason: '初回申請理由',
      initialPunchType: 'CLOCK_IN',
      initialOccurredAtIso: '2026-01-23T09:00:00.000Z',
    });

    await request(httpServer as never)
      .post('/attendance-correction/resubmit/break-end')
      .set('x-user-id', userId)
      .send({
        workDate: workDateIso,
        occurredAt: occurredAtIso,
        reason: '再申請理由',
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
    expect(correction?.events).toHaveLength(3);

    const latest = correction?.events[2];
    expect(latest?.type).toBe('REQUESTED');
    expect(latest?.actorUserId).toBe(userId);
    expect(latest?.punches).toEqual([
      { punchType: 'BREAK_END', occurredAt: occurredAtIso },
    ]);
  });

  it('異常系: 勤怠修正申請が存在しない場合は404で返る', async () => {
    const userId = ulid();
    const workDateIso = '2026-01-24T00:00:00.000Z';

    const res = await request(httpServer as never)
      .post('/attendance-correction/resubmit/clock-in')
      .set('x-user-id', userId)
      .send({
        workDate: workDateIso,
        occurredAt: '2026-01-24T09:00:00.000Z',
        reason: '再申請理由',
      })
      .expect(404);

    const body: unknown = res.body;
    expect(body).toMatchObject({
      statusCode: 404,
      errorCode: 'NOT_FOUND',
    });
  });

  it('異常系: 差し戻し以外（申請中）の勤怠修正は再申請できず400で返る', async () => {
    const userId = ulid();
    const workDateIso = '2026-01-25T00:00:00.000Z';

    // REQUESTEDのみ（PENDING）
    await prisma.attendanceCorrection.create({
      data: {
        id: ulid(),
        userId,
        workDate: parseISOString(workDateIso),
        reason: '初回申請理由',
        events: {
          create: [
            {
              id: ulid(),
              type: 'REQUESTED',
              occurredAt: parseISOString(workDateIso),
              actorUserId: userId,
              reason: '初回申請理由',
              comment: null,
              punches: [
                {
                  punchType: 'CLOCK_IN',
                  occurredAt: '2026-01-25T09:00:00.000Z',
                },
              ],
            },
          ],
        },
      },
    });

    const res = await request(httpServer as never)
      .post('/attendance-correction/resubmit/clock-in')
      .set('x-user-id', userId)
      .send({
        workDate: workDateIso,
        occurredAt: '2026-01-25T09:10:00.000Z',
        reason: '再申請理由',
      })
      .expect(400);

    const body: unknown = res.body;
    expect(body).toMatchObject({
      statusCode: 400,
      errorCode: 'DOMAIN_ERROR',
    });
  });
});
