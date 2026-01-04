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

## 永続化（Repository）方針

### 目的

- 勤怠は **「日次集約（AttendanceRecord）＋イベント（PunchEvent）追加」** で成立するため、永続化も「集約の差分更新」ではなく **イベント追加**を中心に設計する。
- `attendance_records` は `(userId, workDate)` で一意（`@@unique([userId, workDate])`）のため、「その日が初回かどうか」で分岐しない永続化が望ましい。

### 方針（connectOrCreate）

- `attendance_punch_events` を追加する際に、親の `attendance_records` を `connectOrCreate` で解決する。
  - **その日の record が無ければ作成**
  - **あれば接続してイベントのみ追加**
- Prisma の `createMany` は `connectOrCreate` を使えないため、イベント追加は 1件ずつ `create` を行う。

### save(record) の前提

- `AttendanceRecordRepository.save({ record })` は、「集約全体を保存」ではなく **新規に追加された PunchEvent だけ**を永続化する。
- 判定はドメインVOの設計に合わせて以下とする：
  - **DB復元した PunchEvent には `createdAt` が入る**
  - **新規に追加した PunchEvent は `createdAt` が未設定（undefined）**
  - よって `createdAt === undefined` を「未永続化イベント」として扱う

### トランザクション方針

- **単発の打刻（イベント追加のみ）**は、`connectOrCreate + punch event create` が1操作で完結するため、UseCaseで必須ではない。

## createdAt の扱い（永続化判定と並び順）

### 目的

本プロジェクトでは「イベントを append-only で積む」設計のため、Repository が **差分（新規イベント）だけ**を永続化できる仕組みが必要になる。

### 方針

- `createdAt` は **DBに保存された時刻**として扱う
- ただし Repository 実装では `createdAt` を **「永続化済みかどうかの判定（フラグ）」**としても利用する
  - **DB復元したイベント**: `createdAt` が入る
  - **新規に追加したイベント**: `createdAt` は `undefined` のまま
  - Repository は `createdAt === undefined` のイベントだけを insert する

### 注意点（並び順）

このプロジェクトでは、`occurredAt` は **モデルに依らず**「そのイベントが実際に起きた時刻」として同じ意味で扱う。

- **AttendancePunchEvent（勤怠の打刻）**
  - `occurredAt`: 打刻が「実際に起きた時刻」（勤務タイムライン上の時刻）
  - 状態導出（WORKING/FINISHED等）や時系列は、原則 `occurredAt` を基準に扱う

- **AttendanceCorrectionEvent（勤怠修正のイベント）**
  - `occurredAt`: 申請/承認/差し戻し/取り下げ等の「イベントが起きた時刻」（requestedAt/approvedAt... を統一して保持）
  - 状態導出（PENDING/APPROVED等）や履歴の時系列は、原則 `occurredAt` を基準に扱う

`createdAt` は「DBに保存された時刻」であり、以下に限定して利用する：

- Repository が **永続化済み判定**（`createdAt === undefined` を未永続として insert 対象にする）に使う
- 並び順で同時刻が発生しうる場合の **安定ソートの補助**（例：`occurredAt ASC, createdAt ASC, id ASC`）

### 将来的な改善案

- `createdAt` の二重用途（時刻 + 永続化判定）を避けたい場合は、以下のいずれかに移行する可能性がある
  - **イベントに `id`（永続化ID）を持たせる**（例：`attendance_correction_events.id` をドメインイベントに取り込む）
    - 保存済み判定が時刻に依存しなくなる
  - **`persistedAt` のような専用フィールドを追加**し、`createdAt` と役割を分離する
