import { PunchSource } from 'src/query/type/attendace-record/punch-source';
import { PunchType } from 'src/query/type/attendace-record/punch-type';

export type PunchEvent = {
  punchType: PunchType;
  occurredAt: Date;
  createdAt?: Date;
  source: PunchSource;
  sourceId?: string;
};
