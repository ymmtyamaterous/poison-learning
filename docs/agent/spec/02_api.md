# API 設計書

## 1. 基本方針

- **APIレイヤー**: oRPC（型安全なRPC）を使用
- **サーバーフレームワーク**: Hono（Bunランタイム）
- **エンドポイントベース**: `/api/...`
- **レスポンス形式**: JSON
- **認証**: better-auth セッションベース（Cookie）
- **エラーハンドリング**: oRPC 標準エラー型を使用

---

## 2. ルーター構成

```
packages/api/src/routers/
├── index.ts         # appRouter（全ルーターのマージ）
├── toxins.ts        # 毒物 CRUD
├── categories.ts    # カテゴリ
├── articles.ts      # 記事
├── history.ts       # 歴史タイムライン
├── search.ts        # 横断検索
├── stats.ts         # サイト統計
└── bookmarks.ts     # ブックマーク（要認証）
```

---

## 3. エンドポイント一覧

### 3-1. 毒物 (toxins)

#### `toxins.list`
毒物一覧を取得する。

**入力パラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `page` | `number` | - | ページ番号（デフォルト: 1） |
| `limit` | `number` | - | 1ページあたりの件数（デフォルト: 20、最大: 100） |
| `categorySlug` | `string` | - | カテゴリスラッグでフィルタ |
| `dangerLevel` | `1\|2\|3\|4\|5` | - | 危険度でフィルタ |
| `toxinClass` | `string` | - | 毒素クラスでフィルタ |
| `tag` | `string` | - | タグスラッグでフィルタ |
| `sortBy` | `'dangerLevel'\|'name'\|'createdAt'` | - | ソート基準（デフォルト: `name`） |
| `sortOrder` | `'asc'\|'desc'` | - | ソート順（デフォルト: `asc`） |

**レスポンス**
```ts
{
  items: ToxinSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

#### `toxins.get`
毒物詳細を取得する。

**入力パラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `slug` | `string` | ✓ | 毒物スラッグ |

**レスポンス**
```ts
{
  id: number;
  slug: string;
  nameJa: string;
  nameEn: string;
  category: CategorySummary;
  description: string;
  dangerLevel: 1 | 2 | 3 | 4 | 5;
  molecularFormula: string | null;
  molecularWeight: number | null;
  ld50: string | null;           // "10 μg/kg (マウス経口)" 形式の文字列
  toxinClass: string | null;
  target: string | null;
  producingOrganism: string | null;
  antidote: string | null;
  mechanism: MechanismStep[] | null;
  tags: Tag[];
  relatedToxins: ToxinSummary[];
  createdAt: string;
  updatedAt: string;
}
```

---

#### `toxins.spotlight`
トップページ掲載用の注目毒物を取得する。

**入力パラメータ**: なし

**レスポンス**
```ts
ToxinSummary[]   // 最大 6件
```

---

#### `toxins.ranking`
危険度ランキングを取得する。

**入力パラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `limit` | `number` | - | 取得件数（デフォルト: 20） |
| `categorySlug` | `string` | - | カテゴリ絞り込み |

**レスポンス**
```ts
{
  items: (ToxinSummary & { rank: number })[];
}
```

---

### 3-2. カテゴリ (categories)

#### `categories.list`
カテゴリ一覧を取得する。

**入力パラメータ**: なし

**レスポンス**
```ts
Category[]
```

---

#### `categories.get`
カテゴリ詳細を取得する。

**入力パラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `slug` | `string` | ✓ | カテゴリスラッグ |

**レスポンス**
```ts
{
  id: number;
  slug: string;
  nameJa: string;
  nameEn: string;
  description: string;
  icon: string;
  color: string;
  toxinCount: number;
}
```

---

### 3-3. 記事 (articles)

#### `articles.list`
記事一覧を取得する。

**入力パラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `page` | `number` | - | ページ番号 |
| `limit` | `number` | - | 件数（デフォルト: 12） |
| `category` | `string` | - | カテゴリ文字列でフィルタ（`animal\|plant\|chemistry\|history\|medicine\|culture`） |
| `tag` | `string` | - | タグスラッグでフィルタ |

**レスポンス**
```ts
{
  items: ArticleSummary[];
  total: number;
  page: number;
  totalPages: number;
}
```

---

#### `articles.get`
記事詳細を取得する。

**入力パラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `slug` | `string` | ✓ | 記事スラッグ |

**レスポンス**
```ts
{
  id: number;
  slug: string;
  title: string;
  category: string;
  emoji: string;
  excerpt: string;
  content: string;          // Markdown テキスト
  tags: Tag[];
  relatedArticles: ArticleSummary[];
  relatedToxins: ToxinSummary[];
  publishedAt: string;
}
```

---

#### `articles.latest`
最新記事を取得する（トップページ用）。

**入力パラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `limit` | `number` | - | 取得件数（デフォルト: 6） |

**レスポンス**
```ts
ArticleSummary[]
```

---

### 3-4. 歴史タイムライン (history)

#### `history.list`
歴史イベント一覧を取得する。

**入力パラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `tag` | `'culture'\|'science'\|'incident'\|'medicine'` | - | タグでフィルタ |

**レスポンス**
```ts
HistoryEvent[]
```

---

### 3-5. 検索 (search)

#### `search.query`
毒物・記事を横断検索する。

**入力パラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `q` | `string` | ✓ | 検索クエリ（最小1文字） |
| `type` | `'all'\|'toxin'\|'article'` | - | 対象タイプ（デフォルト: `all`） |
| `limit` | `number` | - | 件数（デフォルト: 20） |

**レスポンス**
```ts
{
  toxins: ToxinSummary[];
  articles: ArticleSummary[];
  total: number;
}
```

---

### 3-6. サイト統計 (stats)

#### `stats.get`
サイト統計情報を取得する（トップページ統計バー用）。

**入力パラメータ**: なし

**レスポンス**
```ts
{
  toxinCount: number;        // 収録毒物種数
  chemistryCount: number;    // 化学構造解説数
  historyArticleCount: number; // 歴史・文化記事数
  categoryCount: number;     // カテゴリ数
}
```

---

### 3-7. ブックマーク (bookmarks) ※要認証

#### `bookmarks.list`
ログインユーザーのブックマーク一覧を取得する。

**認証**: 必須

**入力パラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `type` | `'toxin'\|'article'\|'all'` | - | タイプ絞り込み（デフォルト: `all`） |

**レスポンス**
```ts
{
  toxins: (ToxinSummary & { bookmarkedAt: string })[];
  articles: (ArticleSummary & { bookmarkedAt: string })[];
}
```

---

#### `bookmarks.add`
ブックマークを追加する。

**認証**: 必須

**入力パラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `toxinId` | `number` | △ | 毒物ID（`toxinId` か `articleId` のどちらか必須） |
| `articleId` | `number` | △ | 記事ID |

**レスポンス**
```ts
{ success: true; bookmarkId: number }
```

---

#### `bookmarks.remove`
ブックマークを削除する。

**認証**: 必須

**入力パラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `bookmarkId` | `number` | ✓ | ブックマークID |

**レスポンス**
```ts
{ success: true }
```

---

#### `bookmarks.isBookmarked`
特定コンテンツがブックマーク済みか確認する。

**認証**: 必須

**入力パラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `toxinId` | `number` | △ | 毒物ID |
| `articleId` | `number` | △ | 記事ID |

**レスポンス**
```ts
{ bookmarked: boolean; bookmarkId: number | null }
```

---

## 4. 共通型定義

```ts
// 毒物サマリー（一覧・関連表示用）
type ToxinSummary = {
  id: number;
  slug: string;
  nameJa: string;
  nameEn: string;
  categorySlug: string;
  categoryNameJa: string;
  dangerLevel: 1 | 2 | 3 | 4 | 5;
  molecularFormula: string | null;
  excerpt: string;           // description の先頭100字
  emoji: string;             // 代表絵文字
  toxinClass: string | null;
};

// カテゴリサマリー
type CategorySummary = {
  id: number;
  slug: string;
  nameJa: string;
  nameEn: string;
  icon: string;
  color: string;
};

// カテゴリ（完全情報）
type Category = CategorySummary & {
  description: string;
  toxinCount: number;
  tags: string[];
};

// 記事サマリー（一覧・関連表示用）
type ArticleSummary = {
  id: number;
  slug: string;
  title: string;
  category: string;
  emoji: string;
  excerpt: string;
  publishedAt: string;
  tags: Tag[];
};

// タグ
type Tag = {
  id: number;
  slug: string;
  name: string;
};

// 作用機序ステップ
type MechanismStep = {
  step: number;
  title: string;
  description: string;
};

// 歴史イベント
type HistoryEvent = {
  id: number;
  year: string;         // 表示用 "BC 399", "1978" など
  yearSort: number;     // ソート用数値 (-399, 1978 など)
  title: string;
  description: string;
  tag: 'culture' | 'science' | 'incident' | 'medicine';
};
```

---

## 5. エラーハンドリング

oRPC の標準エラーコードを使用する。

| コード | HTTPステータス | 説明 |
|--------|--------------|------|
| `NOT_FOUND` | 404 | 指定リソースが存在しない |
| `UNAUTHORIZED` | 401 | 認証が必要 |
| `BAD_REQUEST` | 400 | 入力値バリデーションエラー |
| `INTERNAL_SERVER_ERROR` | 500 | サーバー内部エラー |

---

## 6. 認証フロー

better-auth を使用した Cookie ベースの認証。

```
[ブラウザ]
  → POST /api/auth/sign-in     (メール + パスワード)
  ← Set-Cookie: session=...

  → GET  /api/...              (Cookie 自動付与)
  ← 認証済みレスポンス
```

oRPC の `context.ts` でセッション情報を取得し、各ルーターで認証チェックを行う。

```ts
// packages/api/src/context.ts
export type Context = {
  session: Session | null;
  user: User | null;
};
```
