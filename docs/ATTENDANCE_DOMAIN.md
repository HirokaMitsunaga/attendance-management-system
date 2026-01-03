# 勤怠ドメイン設計メモ

## 目的

勤怠（打刻）と勤怠修正（申請/承認）を **別集約**として扱いつつ、承認時に勤怠へ反映するための設計判断を共有する。

## 用語

- **勤怠（AttendanceRecord / PunchEvent）**: 勤務タイムラインの事実（出勤/退勤/休憩）
- **勤怠修正（AttendanceCorrection / AttendanceCorrectionEvent）**: 申請〜承認フローの事実（申請/差し戻し/承認/取り下げ）

## モデルの考え方

### 勤怠（PunchEvent）は VO（クラス）で表現する

- **同じ構造が繰り返される**
  - `punchType / occurredAt / source / sourceId` が共通
- **不変条件を閉じ込めたい**
  - `source=NORMAL` のとき `sourceId` は禁止
  - `source=CORRECTION` のとき `sourceId` は必須
- **append-only**
  - 既存のイベントを更新せず、追加で履歴を積む

### 勤怠修正イベントは discriminated union（type）で表現する

[discriminated union の参考 (TypeScript Handbook 日本語訳)](https://typescriptbook.jp/reference/values-types-variables/discriminated-union)

- `REQUESTED / REJECTED / APPROVED / CANCELED` で **項目が異なる**
  - 例: `comment` は差し戻し時のみ、など
- TypeScript の discriminated union で「存在しない項目を触れない」形にできる

## 状態（ステータス）の扱い

どちらの集約も状態遷移を持つが、**何の事実を記録しているか**で区別する。

- 勤怠の状態（例: WORKING / FINISHED）は **PunchEvent から導出**
- 修正の状態（例: PENDING / APPROVED）は **AttendanceCorrectionEvent から導出**

## 承認時反映（同期・同一トランザクション）

方針: **承認時にだけ勤怠へ反映**する。

- 修正集約を `approve()` して `APPROVED` イベントを追加
- `APPROVED.punchEvents` を取り出して、勤怠集約へ `PunchEvent` を追加
- ルールは打刻と同じ基準を適用（`AttendanceRulePolicy` を共通利用）

## 冪等性（source + sourceId）

勤怠に反映される `PunchEvent` は `source/sourceId` を持つ。

- `source=NORMAL`: 画面からの通常打刻
- `source=CORRECTION`: 勤怠修正の承認反映
  - `sourceId`: 勤怠修正のID（承認元）
