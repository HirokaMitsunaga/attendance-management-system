import { isAfterOrEqual, isBeforeOrEqual } from './time-utils';

describe('time-utils', () => {
  describe('isBeforeOrEqual', () => {
    it('正常系: nowが指定時刻より前ならtrue', () => {
      const now = new Date(2024, 0, 15, 10, 29, 0);
      expect(isBeforeOrEqual(now, '10:30')).toBe(true);
    });

    it('正常系: nowが指定時刻と同じならtrue（境界）', () => {
      const now = new Date(2024, 0, 15, 10, 30, 0);
      expect(isBeforeOrEqual(now, '10:30')).toBe(true);
    });

    it('正常系: nowが指定時刻より後ならfalse', () => {
      const now = new Date(2024, 0, 15, 10, 31, 0);
      expect(isBeforeOrEqual(now, '10:30')).toBe(false);
    });
  });

  describe('isAfterOrEqual', () => {
    it('正常系: nowが指定時刻より前ならfalse', () => {
      const now = new Date(2024, 0, 15, 16, 59, 0);
      expect(isAfterOrEqual(now, '17:00')).toBe(false);
    });

    it('正常系: nowが指定時刻と同じならtrue（境界）', () => {
      const now = new Date(2024, 0, 15, 17, 0, 0);
      expect(isAfterOrEqual(now, '17:00')).toBe(true);
    });

    it('正常系: nowが指定時刻より後ならtrue', () => {
      const now = new Date(2024, 0, 15, 17, 1, 0);
      expect(isAfterOrEqual(now, '17:00')).toBe(true);
    });
  });

  describe('不正な時刻形式', () => {
    it('異常系: "24:00" は例外', () => {
      const now = new Date(2024, 0, 15, 0, 0, 0);
      expect(() => isBeforeOrEqual(now, '24:00')).toThrow(
        '不正な時刻形式です: 24:00',
      );
    });

    it('異常系: "10:60" は例外', () => {
      const now = new Date(2024, 0, 15, 0, 0, 0);
      expect(() => isAfterOrEqual(now, '10:60')).toThrow(
        '不正な時刻形式です: 10:60',
      );
    });

    it('異常系: "abc" は例外', () => {
      const now = new Date(2024, 0, 15, 0, 0, 0);
      expect(() => isAfterOrEqual(now, 'abc')).toThrow(
        '不正な時刻形式です: abc',
      );
    });
  });
});
