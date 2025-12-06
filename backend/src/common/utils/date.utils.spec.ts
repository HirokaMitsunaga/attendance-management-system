import {
  getCurrentDate,
  formatDateToJST,
  formatDateToISOString,
  parseISOString,
} from './date.utils';

describe('DateUtils', () => {
  describe('getCurrentDate', () => {
    it('正常系: 現在の日時を取得できる', () => {
      const before = new Date();
      const current = getCurrentDate();
      const after = new Date();

      expect(current).toBeInstanceOf(Date);
      expect(current.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(current.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('formatDateToJST', () => {
    it('正常系: DateオブジェクトをJST文字列にフォーマットできる', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const formatted = formatDateToJST(date);

      expect(typeof formatted).toBe('string');
      expect(formatted).toMatch(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}/);
    });

    it('正常系: 文字列形式の日付をJST文字列にフォーマットできる', () => {
      const dateString = '2024-01-01T12:00:00Z';
      const formatted = formatDateToJST(dateString);

      expect(typeof formatted).toBe('string');
      expect(formatted).toMatch(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}/);
    });
  });

  describe('formatDateToISOString', () => {
    it('正常系: 日付を指定せずにISO文字列を取得できる', () => {
      const formatted = formatDateToISOString();

      expect(typeof formatted).toBe('string');
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('正常系: DateオブジェクトをISO文字列にフォーマットできる', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const formatted = formatDateToISOString(date);

      expect(formatted).toBe('2024-01-01');
    });

    it('正常系: 文字列形式の日付をISO文字列にフォーマットできる', () => {
      const dateString = '2024-01-01T12:00:00Z';
      const formatted = formatDateToISOString(dateString);

      expect(formatted).toBe('2024-01-01');
    });
  });

  describe('parseISOString', () => {
    it('正常系: ISO文字列からDateオブジェクトを作成できる', () => {
      const dateString = '2024-01-01';
      const date = parseISOString(dateString);

      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(1);
    });

    it('正常系: ISO文字列（時刻付き）からDateオブジェクトを作成できる', () => {
      const dateString = '2024-01-01T12:00:00Z';
      const date = parseISOString(dateString);

      expect(date).toBeInstanceOf(Date);
    });
  });
});
