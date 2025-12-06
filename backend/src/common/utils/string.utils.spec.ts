import { splitIds } from './string.utils';

describe('StringUtils', () => {
  describe('splitIds', () => {
    it('正常系: カンマ区切りのID文字列を配列に分割できる', () => {
      const value = 'id1,id2,id3';
      const result = splitIds(value);

      expect(result).toEqual(['id1', 'id2', 'id3']);
    });

    it('正常系: スペース区切りのID文字列を配列に分割できる', () => {
      const value = 'id1 id2 id3';
      const result = splitIds(value);

      expect(result).toEqual(['id1', 'id2', 'id3']);
    });

    it('正常系: カンマとスペースが混在するID文字列を配列に分割できる', () => {
      const value = 'id1, id2 id3,id4';
      const result = splitIds(value);

      expect(result).toEqual(['id1', 'id2', 'id3', 'id4']);
    });

    it('正常系: 空文字列を除外できる', () => {
      const value = 'id1,,id2, ,id3';
      const result = splitIds(value);

      expect(result).toEqual(['id1', 'id2', 'id3']);
    });

    it('正常系: 前後の空白をトリムできる', () => {
      const value = ' id1 , id2 , id3 ';
      const result = splitIds(value);

      expect(result).toEqual(['id1', 'id2', 'id3']);
    });

    it('正常系: 空文字列の場合は空配列を返す', () => {
      const value = '';
      const result = splitIds(value);

      expect(result).toEqual([]);
    });

    it('正常系: 空白のみの場合は空配列を返す', () => {
      const value = '   ';
      const result = splitIds(value);

      expect(result).toEqual([]);
    });

    it('正常系: 単一のID文字列を配列に分割できる', () => {
      const value = 'id1';
      const result = splitIds(value);

      expect(result).toEqual(['id1']);
    });
  });
});
