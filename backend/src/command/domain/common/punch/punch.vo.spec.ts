import { PunchVO } from './punch.vo';
import { PUNCH_TYPE } from './punch-type';
import { PUNCH_SOURCE } from './punch-source';
import { EntityId } from '../../entity-id.vo';
import { DomainError } from '../../../../common/errors/domain.error';

describe('PunchVO', () => {
  const occurredAt = new Date('2024-01-15T01:00:00.000Z');

  describe('source/sourceId整合性', () => {
    it('正常系: 通常打刻(NORMAL)はsourceIdなしで作成できる', () => {
      expect(() => {
        PunchVO.create({
          punchType: PUNCH_TYPE.CLOCK_IN,
          occurredAt,
          source: PUNCH_SOURCE.NORMAL,
        });
      }).not.toThrow();
    });

    it('異常系: 通常打刻(NORMAL)にsourceIdを指定するとエラー', () => {
      expect(() => {
        PunchVO.create({
          punchType: PUNCH_TYPE.CLOCK_IN,
          occurredAt,
          source: PUNCH_SOURCE.NORMAL,
          sourceId: EntityId.generate(),
        });
      }).toThrow(DomainError);
    });

    it('正常系: 修正打刻(CORRECTION)はsourceIdありで作成できる', () => {
      expect(() => {
        PunchVO.create({
          punchType: PUNCH_TYPE.CLOCK_IN,
          occurredAt,
          source: PUNCH_SOURCE.CORRECTION,
          sourceId: EntityId.generate(),
        });
      }).not.toThrow();
    });

    it('異常系: 修正打刻(CORRECTION)でsourceIdなしだとエラー', () => {
      expect(() => {
        PunchVO.create({
          punchType: PUNCH_TYPE.CLOCK_IN,
          occurredAt,
          source: PUNCH_SOURCE.CORRECTION,
        });
      }).toThrow(DomainError);
    });
  });
});
