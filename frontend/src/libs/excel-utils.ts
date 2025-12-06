/**
 * Excel出力用の共通ユーティリティ
 */

export type ExcelHeader = {
  key: string;
  label: string;
  validation?: {
    type: 'list';
    values: string[];
  };
};

export type ExcelData = Record<string, unknown>[];

/**
 * Excelファイルを生成してダウンロード（プルダウン対応）
 */
export const downloadExcel = async ({
  data,
  headers,
  filename,
  sheetName = 'Sheet1',
}: {
  data: ExcelData;
  headers: ExcelHeader[];
  filename: string;
  sheetName?: string;
}): Promise<void> => {
  // 動的インポート（クライアントサイドで使用するため）

  const ExcelJS = (await import('exceljs')).default;

  // ワークブックを作成
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // ExcelJSのdataValidationsを初期化
  // ワークシートオブジェクトのdataValidationsプロパティを使用
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const worksheetAny = worksheet as any;
  // dataValidationsが存在しない場合は初期化（ExcelJSでは自動的に初期化されるはず）
  if (!worksheetAny.dataValidations) {
    // dataValidationsが自動的に初期化されない場合は、空の配列を設定
    // 実際にはExcelJSが自動的に初期化するはずですが、念のため
    worksheetAny.dataValidations = {
      add: function (range: string, options: unknown) {
        // 実際の実装では、ExcelJSが内部で処理するはず
        // ここでは空の実装としておく

        void range;

        void options;
      },
    };
  }

  // ヘッダー行を作成
  const headerRow = worksheet.addRow(headers.map((h) => h.label));

  // ヘッダー行のスタイル設定
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  // データ行を追加（データがない場合は空行を1つ追加してプルダウンを設定可能にする）
  const dataRows = data.length > 0 ? data : [{}];
  dataRows.forEach((row) => {
    const dataRow = worksheet.addRow(
      headers.map((header) => row[header.key] ?? ''),
    );
    dataRow.alignment = { vertical: 'middle' };
  });

  // 列ごとにスタイルとデータ検証を設定
  headers.forEach((header, colIndex) => {
    const column = worksheet.getColumn(colIndex + 1);

    // 列幅を自動調整
    const maxLength = Math.max(
      header.label.length,
      ...dataRows.map((row) => String(row[header.key] ?? '').length),
      10, // 最小幅
    );
    column.width = Math.min(maxLength + 2, 50); // 最大幅50

    // プルダウン（データ検証）を設定
    if (
      header.validation &&
      header.validation.type === 'list' &&
      header.validation.values.length > 0 &&
      header.validation.values.some((v) => v !== '')
    ) {
      // カラム文字を取得（A, B, C...Z, AA, AB...）
      const getColumnLetter = (colIndex: number): string => {
        let result = '';
        let index = colIndex;
        while (index >= 0) {
          result = String.fromCharCode(65 + (index % 26)) + result;
          index = Math.floor(index / 26) - 1;
        }
        return result;
      };

      const columnLetter = getColumnLetter(colIndex);
      const startRow = 2; // ヘッダーの次の行
      const endRow = 1000; // 常に1000行まで設定

      // 空文字列を除いた値のリストを作成
      const validValues = header.validation.values.filter((v) => v !== '');

      // データ検証のformulaを正しい形式で作成
      // ExcelJSでは、リストタイプのデータ検証の場合、formulaeに以下の形式で渡す必要がある
      // '"Value1,Value2,Value3"' (全体をダブルクォートで囲み、値はカンマ区切り)
      // カンマをエスケープする必要はない
      const formula = `"${validValues
        .map((v) => {
          // 値内のダブルクォートのみエスケープ（2つにする）
          return String(v).replace(/"/g, '""');
        })
        .join(',')}"`;

      // ExcelJSの正しい方法: セルごとにdataValidationプロパティを設定
      // 範囲内の各セルにデータ検証を設定
      for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
        const cell = worksheet.getCell(`${columnLetter}${rowIndex}`);
        cell.dataValidation = {
          type: 'list',
          allowBlank: true, // 空白を許可
          formulae: [formula], // formulaを配列として渡す（Excelのリスト形式）
          showInputMessage: true,
          promptTitle: '選択してください',
          prompt: `以下の値から選択してください: ${validValues.join(', ')}`,
          showErrorMessage: true,
          errorStyle: 'warning',
          errorTitle: '無効な値',
          error: `以下の値から選択してください: ${validValues.join(', ')}`,
        };
      }
    }
  });

  // 行の高さを設定
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      row.height = 20; // ヘッダー行
    } else {
      row.height = 15; // データ行
    }
  });

  // テーブルスタイルを適用（オプション）
  if (data.length > 0) {
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });
  }

  // Excelファイルを生成してダウンロード
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
