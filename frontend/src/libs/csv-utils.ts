/**
 * CSV出力用の共通ユーティリティ
 */

export type CsvHeader = {
  key: string;
  label: string;
};

/**
 * CSVフィールドをエスケープ
 */
const escapeCsvField = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = String(value);
  if (
    stringValue.includes('"') ||
    stringValue.includes(',') ||
    stringValue.includes('\n')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

/**
 * データをCSV形式の文字列に変換
 */
export const convertToCSV = ({
  data,
  headers,
}: {
  data: Record<string, unknown>[];
  headers: CsvHeader[];
}): string => {
  // ヘッダー行を作成（エスケープ処理を追加）
  const headerRow = headers.map((h) => escapeCsvField(h.label)).join(',');

  // データ行を作成
  const dataRows = data.map((row) => {
    return headers.map((header) => escapeCsvField(row[header.key])).join(',');
  });

  // BOMを追加してExcelで文字化けしないようにする
  const BOM = '\uFEFF';
  return BOM + [headerRow, ...dataRows].join('\n');
};

/**
 * CSV文字列をBlobに変換してダウンロード
 */
export const downloadCSV = ({
  csvContent,
  filename,
}: {
  csvContent: string;
  filename: string;
}): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
