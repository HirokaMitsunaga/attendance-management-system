/**
 * 配列を指定したサイズのチャンクに分割する
 * @param array 分割する配列
 * @param size チャンクのサイズ
 * @returns チャンクの配列
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size),
  );
};
