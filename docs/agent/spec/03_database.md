# データベース設計書

## 1. 基本方針

- **データベース**: SQLite
- **ORM**: Drizzle ORM
- **スキーマディレクトリ**: `packages/db/src/schema/`
- **文字コード**: UTF-8
- **タイムスタンプ**: ISO 8601 形式（UTC）のテキスト型で格納

---

## 2. ER 図（概念）

```
categories ──< toxins >── toxin_tags >── tags
                  │
                  └── bookmarks
articles >── article_tags >── tags
    │
    └── bookmarks

users (better-auth 管理)
    └── bookmarks

history_events
```

---

## 3. テーブル定義

### 3-1. `categories`（カテゴリ）

| カラム名 | 型 | NOT NULL | PK/UK | デフォルト | 説明 |
|---------|-----|----------|-------|-----------|------|
| `id` | INTEGER | ✓ | PK (autoincrement) | - | カテゴリID |
| `slug` | TEXT | ✓ | UNIQUE | - | URLスラッグ（例: `animal`, `plant`, `chemistry`, `history`） |
| `name_ja` | TEXT | ✓ | - | - | 日本語名（例: 動物の毒） |
| `name_en` | TEXT | ✓ | - | - | 英語名（例: ANIMAL VENOM） |
| `description` | TEXT | ✓ | - | - | カテゴリ説明文 |
| `icon` | TEXT | ✓ | - | - | 代表絵文字（例: 🐍） |
| `color` | TEXT | ✓ | - | - | アクセントカラー（hex 例: `#e03a3a`） |
| `display_order` | INTEGER | ✓ | - | `0` | 表示順 |
| `created_at` | TEXT | ✓ | - | `CURRENT_TIMESTAMP` | 作成日時 |

**初期データ（シード）**
```
animal    / 動物の毒    / ANIMAL VENOM    / 🐍 / #e03a3a
plant     / 植物の毒    / PLANT TOXIN     / 🌿 / #39e06a
chemistry / 毒の化学    / TOXIN CHEMISTRY / ⚗️ / #a78bfa
history   / 歴史と文化  / HISTORY & CULTURE / 📜 / #f59e0b
```

---

### 3-2. `toxins`（毒物）

| カラム名 | 型 | NOT NULL | PK/UK | デフォルト | 説明 |
|---------|-----|----------|-------|-----------|------|
| `id` | INTEGER | ✓ | PK (autoincrement) | - | 毒物ID |
| `slug` | TEXT | ✓ | UNIQUE | - | URLスラッグ（例: `tetrodotoxin`） |
| `name_ja` | TEXT | ✓ | - | - | 日本語名（例: テトロドトキシン） |
| `name_en` | TEXT | ✓ | - | - | 英語名・学名（例: Tetrodotoxin (TTX)） |
| `category_id` | INTEGER | ✓ | FK → categories.id | - | カテゴリID |
| `description` | TEXT | ✓ | - | - | 詳細説明文 |
| `emoji` | TEXT | ✓ | - | `'☠'` | 代表絵文字 |
| `danger_level` | INTEGER | ✓ | - | - | 危険度 1〜5（LD₅₀ベース） |
| `molecular_formula` | TEXT | - | - | NULL | 分子式（例: C₁₁H₁₇N₃O₈） |
| `molecular_weight` | REAL | - | - | NULL | 分子量（例: 319.27） |
| `ld50` | TEXT | - | - | NULL | LD₅₀ 値と条件（例: "10 μg/kg (マウス経口)"） |
| `toxin_class` | TEXT | - | - | NULL | 毒素クラス（例: 非タンパク質毒素） |
| `target` | TEXT | - | - | NULL | 作用標的（例: Nav チャネル） |
| `producing_organism` | TEXT | - | - | NULL | 産生生物（例: フグ・イモリ） |
| `antidote` | TEXT | - | - | NULL | 解毒剤（例: なし（対症療法）） |
| `mechanism` | TEXT | - | - | NULL | 作用機序 JSON（`MechanismStep[]`） |
| `is_spotlight` | INTEGER | ✓ | - | `0` | トップページ掲載フラグ（0/1） |
| `created_at` | TEXT | ✓ | - | `CURRENT_TIMESTAMP` | 作成日時 |
| `updated_at` | TEXT | ✓ | - | `CURRENT_TIMESTAMP` | 更新日時 |

**インデックス**
- `idx_toxins_category_id` → `category_id`
- `idx_toxins_danger_level` → `danger_level`
- `idx_toxins_is_spotlight` → `is_spotlight`

**`mechanism` JSON スキーマ**
```json
[
  {
    "step": 1,
    "title": "電位依存性 Na⁺ チャネルへの結合",
    "description": "TTX はチャネルの外側（...）"
  },
  ...
]
```

---

### 3-3. `articles`（記事）

| カラム名 | 型 | NOT NULL | PK/UK | デフォルト | 説明 |
|---------|-----|----------|-------|-----------|------|
| `id` | INTEGER | ✓ | PK (autoincrement) | - | 記事ID |
| `slug` | TEXT | ✓ | UNIQUE | - | URLスラッグ |
| `title` | TEXT | ✓ | - | - | 記事タイトル |
| `category` | TEXT | ✓ | - | - | カテゴリ（`animal`/`plant`/`chemistry`/`history`/`medicine`/`culture`） |
| `emoji` | TEXT | ✓ | - | - | 代表絵文字 |
| `excerpt` | TEXT | ✓ | - | - | 抜粋・リード文（最大200文字） |
| `content` | TEXT | ✓ | - | - | 本文（Markdown形式） |
| `published_at` | TEXT | ✓ | - | `CURRENT_TIMESTAMP` | 公開日時 |
| `created_at` | TEXT | ✓ | - | `CURRENT_TIMESTAMP` | 作成日時 |
| `updated_at` | TEXT | ✓ | - | `CURRENT_TIMESTAMP` | 更新日時 |

**インデックス**
- `idx_articles_category` → `category`
- `idx_articles_published_at` → `published_at DESC`

---

### 3-4. `tags`（タグ）

| カラム名 | 型 | NOT NULL | PK/UK | デフォルト | 説明 |
|---------|-----|----------|-------|-----------|------|
| `id` | INTEGER | ✓ | PK (autoincrement) | - | タグID |
| `slug` | TEXT | ✓ | UNIQUE | - | URLスラッグ（例: `snake-venom`） |
| `name` | TEXT | ✓ | - | - | 表示名（例: ヘビ毒） |
| `created_at` | TEXT | ✓ | - | `CURRENT_TIMESTAMP` | 作成日時 |

**初期データ（シード）**
```
snake-venom     / ヘビ毒
scorpion-venom  / サソリ毒
pufferfish      / フグ毒
jellyfish       / クラゲ毒
spider-venom    / クモ毒
monkshood       / トリカブト
mushroom        / 毒キノコ
belladonna      / ベラドンナ
hemlock         / ドクニンジン
alkaloid        / アルカロイド
neurotoxin      / 神経毒
ion-channel     / イオンチャネル
ld50            / LD₅₀
antidote        / 解毒剤
ancient-greece  / 古代ギリシャ
assassination   / 暗殺史
medicine        / 毒と医療
chemistry       / 化学
history         / 歴史
culture         / 文化
```

---

### 3-5. `toxin_tags`（毒物×タグ 中間テーブル）

| カラム名 | 型 | NOT NULL | PK | 説明 |
|---------|-----|----------|-----|------|
| `toxin_id` | INTEGER | ✓ | PK | FK → toxins.id（CASCADE DELETE） |
| `tag_id` | INTEGER | ✓ | PK | FK → tags.id（CASCADE DELETE） |

---

### 3-6. `article_tags`（記事×タグ 中間テーブル）

| カラム名 | 型 | NOT NULL | PK | 説明 |
|---------|-----|----------|-----|------|
| `article_id` | INTEGER | ✓ | PK | FK → articles.id（CASCADE DELETE） |
| `tag_id` | INTEGER | ✓ | PK | FK → tags.id（CASCADE DELETE） |

---

### 3-7. `history_events`（歴史タイムライン）

| カラム名 | 型 | NOT NULL | PK/UK | デフォルト | 説明 |
|---------|-----|----------|-------|-----------|------|
| `id` | INTEGER | ✓ | PK (autoincrement) | - | イベントID |
| `year` | TEXT | ✓ | - | - | 表示用年代（例: "BC 399", "1538", "2002"） |
| `year_sort` | INTEGER | ✓ | - | - | ソート用数値（例: -399, 1538, 2002） |
| `title` | TEXT | ✓ | - | - | イベントタイトル |
| `description` | TEXT | ✓ | - | - | イベント説明文 |
| `tag` | TEXT | ✓ | - | - | タグ（`culture`/`science`/`incident`/`medicine`） |
| `created_at` | TEXT | ✓ | - | `CURRENT_TIMESTAMP` | 作成日時 |

**インデックス**
- `idx_history_events_year_sort` → `year_sort ASC`

---

### 3-8. `bookmarks`（ブックマーク）

| カラム名 | 型 | NOT NULL | PK/UK | デフォルト | 説明 |
|---------|-----|----------|-------|-----------|------|
| `id` | INTEGER | ✓ | PK (autoincrement) | - | ブックマークID |
| `user_id` | TEXT | ✓ | - | - | FK → users.id（better-auth 管理） |
| `toxin_id` | INTEGER | - | - | NULL | FK → toxins.id（毒物ブックマーク時） |
| `article_id` | INTEGER | - | - | NULL | FK → articles.id（記事ブックマーク時） |
| `created_at` | TEXT | ✓ | - | `CURRENT_TIMESTAMP` | 作成日時 |

**制約**
- `toxin_id` と `article_id` のいずれか一方のみ NOT NULL（アプリ側でバリデーション）
- `UNIQUE (user_id, toxin_id)` 部分インデックス（`toxin_id IS NOT NULL`）
- `UNIQUE (user_id, article_id)` 部分インデックス（`article_id IS NOT NULL`）

**インデックス**
- `idx_bookmarks_user_id` → `user_id`

---

### 3-9. 認証テーブル（better-auth 管理）

better-auth が自動生成する。`packages/db/src/schema/auth.ts` に定義済み。

| テーブル名 | 説明 |
|-----------|------|
| `user` | ユーザー情報 |
| `session` | セッション情報 |
| `account` | OAuth アカウント情報 |
| `verification` | メール認証トークン |

---

## 4. マイグレーション

```bash
# スキーマ変更後にマイグレーションファイル生成
cd packages/db
bun run db:generate

# マイグレーション適用
bun run db:migrate

# Drizzle Studio（GUI）起動
bun run db:studio
```

---

## 5. シードデータ方針

- シードスクリプト: `packages/db/src/seed.ts`
- 実行コマンド: `bun run db:seed`
- 初期データ内容:
  - カテゴリ 4件
  - タグ 約20件
  - サンプル毒物 10件（スポットライト掲載用3件含む）
  - サンプル記事 6件
  - 歴史イベント 6件

---

## 6. 検索実装方針

SQLite の `LIKE` 演算子を使用した全文検索を実装する。

```sql
-- 毒物検索
SELECT * FROM toxins
WHERE name_ja LIKE '%キーワード%'
   OR name_en LIKE '%キーワード%'
   OR description LIKE '%キーワード%';

-- 記事検索
SELECT * FROM articles
WHERE title LIKE '%キーワード%'
   OR excerpt LIKE '%キーワード%'
   OR content LIKE '%キーワード%';
```

> 将来的にデータ量が増えた場合は SQLite FTS5（全文検索拡張）への移行を検討する。
