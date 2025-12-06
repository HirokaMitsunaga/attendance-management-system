/**
 * CSV解析用の共通ユーティリティ
 */

/**
 * CSVファイルを解析してオブジェクト配列に変換
 */
export const parseCSV = async (
  file: File,
): Promise<Record<string, string>[]> => {
  const text = await file.text();
  const lines = text.split('\n').filter((line) => line.trim() !== '');

  if (lines.length === 0) {
    return [];
  }

  // BOMを除去
  const headerLine = lines[0].replace(/^\uFEFF/, '');
  const headers = parseCSVLine(headerLine);

  const data: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }

  return data;
};

/**
 * CSV行を解析（カンマ区切り、ダブルクォート対応）
 */
const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
};
