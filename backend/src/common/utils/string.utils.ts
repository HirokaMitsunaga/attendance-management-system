/**
 * 文字列をカンマまたはスペースで区切って配列に分割する
 * @param value 分割する文字列
 * @returns 分割された文字列の配列（空文字列は除外）
 */
export const splitIds = (value: string): string[] => {
  return value
    .split(/[,\s]+/)
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
};
