import { db } from "./index";
import {
  articleTags,
  articles,
  categories,
  historyEvents,
  tags,
  toxinTags,
  toxins,
} from "./schema";

export async function seed() {
  console.log("🌱 Seeding database...");

  // ─── categories ────────────────────────────────────────────────────────────
  console.log("  → categories");
  await db
    .insert(categories)
    .values([
      {
        slug: "animal",
        nameJa: "動物の毒",
        nameEn: "ANIMAL VENOM",
        description:
          "ヘビ・クモ・サソリ・クラゲ…自然界の動物が持つ毒はどのように進化し、どのように作用するのか。毒の分類から種別解説まで、動物毒の世界を探ります。",
        icon: "🐍",
        color: "#e03a3a",
        displayOrder: 1,
      },
      {
        slug: "plant",
        nameJa: "植物の毒",
        nameEn: "PLANT TOXIN",
        description:
          "トリカブト・ドクニンジン・ベラドンナ…美しい花や実に隠された致命的な毒。植物が毒を持つ理由と、その化学的メカニズムを詳しく解説します。",
        icon: "🌿",
        color: "#39e06a",
        displayOrder: 2,
      },
      {
        slug: "chemistry",
        nameJa: "毒の化学",
        nameEn: "TOXIN CHEMISTRY",
        description:
          "毒はなぜ毒なのか？アルカロイド・神経毒・タンパク毒の構造と受容体への作用機序、LD₅₀値の読み方まで、化学の視点で毒を解剖します。",
        icon: "⚗️",
        color: "#a78bfa",
        displayOrder: 3,
      },
      {
        slug: "history",
        nameJa: "歴史と文化",
        nameEn: "HISTORY & CULTURE",
        description:
          "古代の暗殺・錬金術師の秘薬・近代の毒ガス兵器…毒は人類の歴史に深く刻まれています。神話・医療・犯罪史・芸術に見る「毒」の文化史を紐解きます。",
        icon: "📜",
        color: "#f59e0b",
        displayOrder: 4,
      },
    ])
    .onConflictDoNothing();

  // ─── tags ──────────────────────────────────────────────────────────────────
  console.log("  → tags");
  await db
    .insert(tags)
    .values([
      { slug: "snake-venom", name: "ヘビ毒" },
      { slug: "scorpion-venom", name: "サソリ毒" },
      { slug: "pufferfish", name: "フグ毒" },
      { slug: "jellyfish", name: "クラゲ毒" },
      { slug: "spider-venom", name: "クモ毒" },
      { slug: "monkshood", name: "トリカブト" },
      { slug: "mushroom", name: "毒キノコ" },
      { slug: "belladonna", name: "ベラドンナ" },
      { slug: "hemlock", name: "ドクニンジン" },
      { slug: "alkaloid", name: "アルカロイド" },
      { slug: "neurotoxin", name: "神経毒" },
      { slug: "ion-channel", name: "イオンチャネル" },
      { slug: "ld50", name: "LD₅₀" },
      { slug: "antidote", name: "解毒剤" },
      { slug: "ancient-greece", name: "古代ギリシャ" },
      { slug: "assassination", name: "暗殺史" },
      { slug: "medicine", name: "毒と医療" },
      { slug: "chemistry-tag", name: "化学" },
      { slug: "history-tag", name: "歴史" },
      { slug: "culture", name: "文化" },
      { slug: "protein-toxin", name: "タンパク毒" },
      { slug: "frog", name: "カエル毒" },
    ])
    .onConflictDoNothing();

  // ─── toxins ───────────────────────────────────────────────────────────────
  console.log("  → toxins");

  // カテゴリIDを取得
  const catRows = await db.query.categories.findMany();
  const catMap = Object.fromEntries(catRows.map((c) => [c.slug, c.id]));
  const tagRows = await db.query.tags.findMany();
  const tagMap = Object.fromEntries(tagRows.map((t) => [t.slug, t.id]));

  const toxinData = [
    {
      slug: "tetrodotoxin",
      nameJa: "テトロドトキシン",
      nameEn: "Tetrodotoxin (TTX)",
      categorySlug: "animal",
      emoji: "🐡",
      dangerLevel: 5,
      description:
        "フグをはじめ複数の生物が持つ非タンパク質毒素。電位依存性Naチャネルを選択的に阻害し、神経・筋肉の興奮伝達を遮断する。モルヒネの約1200倍の毒性を持つ。",
      molecularFormula: "C₁₁H₁₇N₃O₈",
      molecularWeight: 319.27,
      ld50: "10 μg/kg（マウス経口）",
      toxinClass: "非タンパク質毒素",
      target: "電位依存性 Na⁺ チャネル（Nav）",
      producingOrganism: "フグ・イモリ・ヒョウモンダコ",
      antidote: "なし（対症療法のみ）",
      isSpotlight: 1,
      mechanism: JSON.stringify([
        {
          step: 1,
          title: "電位依存性 Na⁺ チャネルへの結合",
          description:
            "TTX はチャネルの外側（ドメインI〜IVのP-loop領域）に結合し、孔を物理的にふさぐ。解離定数は数nMと極めて親和性が高い。",
        },
        {
          step: 2,
          title: "活動電位の発生阻害",
          description:
            "Na⁺ 流入が遮断されることで、神経・筋細胞が脱分極できなくなり、活動電位が発生しなくなる。",
        },
        {
          step: 3,
          title: "運動神経・横隔膜麻痺",
          description:
            "末梢神経から随意筋（特に呼吸筋・横隔膜）への信号伝達が途絶え、呼吸不全・心停止へと至る。",
        },
        {
          step: 4,
          title: "TTX-resistant チャネルの存在",
          description:
            "フグ自身はTTX耐性型Naチャネルを持つことで自己毒性を回避。この選択的耐性の仕組みも研究されている。",
        },
      ]),
      tagSlugs: ["pufferfish", "neurotoxin", "ion-channel"],
    },
    {
      slug: "aconitine",
      nameJa: "アコニチン",
      nameEn: "Aconitine",
      categorySlug: "plant",
      emoji: "🌸",
      dangerLevel: 4,
      description:
        "山野に咲く美しい花に隠された猛毒。Naチャネルを活性化し続け、心臓・神経系に壊滅的ダメージを与える。日本では最も身近な毒植物の一つ、トリカブトに含まれる。",
      molecularFormula: "C₃₄H₄₇NO₁₁",
      molecularWeight: 645.73,
      ld50: "0.166 mg/kg（マウス静脈内）",
      toxinClass: "ジテルペンアルカロイド",
      target: "電位依存性 Na⁺ チャネル（活性化持続）",
      producingOrganism: "トリカブト属（Aconitum）",
      antidote: "なし（対症療法・アトロピン投与）",
      isSpotlight: 1,
      mechanism: JSON.stringify([
        {
          step: 1,
          title: "Na⁺ チャネルへの結合と活性化持続",
          description:
            "アコニチンはNa⁺ チャネルの開放状態を安定化させ、チャネルが閉まらない状態にする。これによりNa⁺が持続的に細胞内に流入する。",
        },
        {
          step: 2,
          title: "心筋の持続脱分極",
          description:
            "心筋細胞のNaチャネルが持続開放することで、正常な心電図パターンが崩れ、致死性不整脈が引き起こされる。",
        },
        {
          step: 3,
          title: "神経系への作用",
          description:
            "知覚神経・運動神経に作用し、口唇・四肢のしびれ、灼熱感、筋力低下をきたす。",
        },
      ]),
      tagSlugs: ["monkshood", "alkaloid", "neurotoxin", "ion-channel"],
    },
    {
      slug: "botulinum-toxin",
      nameJa: "ボツリヌストキシン",
      nameEn: "Botulinum Toxin",
      categorySlug: "chemistry",
      emoji: "🧪",
      dangerLevel: 5,
      description:
        "地球上で最も毒性が強い物質の一つ。神経筋接合部でアセチルコリン放出を阻害し弛緩性麻痺を引き起こす。美容医療（ボトックス）への応用でも知られる二面性を持つ。",
      molecularFormula: "タンパク質（150 kDa）",
      molecularWeight: 150000,
      ld50: "1 ng/kg（ヒト推定、吸入）",
      toxinClass: "タンパク質毒素（神経毒）",
      target: "SNARE タンパク質（シナプス小胞放出機構）",
      producingOrganism: "Clostridium botulinum",
      antidote: "抗毒素血清（早期投与）",
      isSpotlight: 1,
      mechanism: JSON.stringify([
        {
          step: 1,
          title: "神経終末への取り込み",
          description:
            "ボツリヌストキシンは末梢運動神経のシナプス前終末に結合し、エンドサイトーシスにより取り込まれる。",
        },
        {
          step: 2,
          title: "SNARE タンパク質の切断",
          description:
            "毒素の軽鎖がSNAREタンパク質（SNAP-25・VAMP・シンタキシン）を切断し、シナプス小胞の細胞膜との融合を阻害する。",
        },
        {
          step: 3,
          title: "アセチルコリン放出遮断",
          description:
            "シナプス小胞が開口放出できなくなり、神経筋接合部でのアセチルコリン放出が完全に遮断される。",
        },
        {
          step: 4,
          title: "弛緩性麻痺",
          description:
            "筋肉への神経信号が届かなくなり、全身の弛緩性麻痺が起こる。呼吸筋麻痺が致死的となる。",
        },
      ]),
      tagSlugs: ["protein-toxin", "neurotoxin", "medicine"],
    },
    {
      slug: "ricin",
      nameJa: "リシン",
      nameEn: "Ricin",
      categorySlug: "plant",
      emoji: "🫘",
      dangerLevel: 5,
      description:
        "トウゴマ（ヒマ）の種子から抽出される猛毒タンパク質。細胞のリボソームを不活化してタンパク質合成を停止させる。1978年のブルガリア傘事件で使用されたことでも知られる。",
      molecularFormula: "タンパク質（65 kDa）",
      molecularWeight: 65000,
      ld50: "1–10 μg/kg（ヒト推定）",
      toxinClass: "タンパク質毒素（リボソーム不活化毒素）",
      target: "リボソーム 28S rRNA",
      producingOrganism: "トウゴマ（Ricinus communis）",
      antidote: "なし（対症療法）",
      isSpotlight: 0,
      mechanism: JSON.stringify([
        {
          step: 1,
          title: "細胞への侵入",
          description:
            "リシンB鎖が細胞表面のガラクトース残基に結合し、エンドサイトーシスで細胞内に取り込まれる。",
        },
        {
          step: 2,
          title: "A鎖の放出",
          description: "エンドソーム内でA鎖とB鎖が分離し、A鎖がサイトゾルに放出される。",
        },
        {
          step: 3,
          title: "リボソームの不活化",
          description:
            "A鎖はリボソームの28S rRNAの特定のアデニン残基を切断し、タンパク質合成を完全に停止させる。1分子のリシンA鎖で数千個のリボソームを不活化できる。",
        },
      ]),
      tagSlugs: ["protein-toxin", "alkaloid"],
    },
    {
      slug: "sarin",
      nameJa: "サリン",
      nameEn: "Sarin (GB)",
      categorySlug: "chemistry",
      emoji: "💀",
      dangerLevel: 5,
      description:
        "有機リン系神経剤。アセチルコリンエステラーゼを不可逆的に阻害し、神経伝達物質アセチルコリンを蓄積させる。1995年の地下鉄サリン事件で世界に衝撃を与えた化学兵器。",
      molecularFormula: "C₄H₁₀FO₂P",
      molecularWeight: 140.09,
      ld50: "1.7 mg/kg（ヒト皮膚、推定）",
      toxinClass: "有機リン系神経剤",
      target: "アセチルコリンエステラーゼ（AChE）",
      producingOrganism: "人工合成（化学兵器）",
      antidote: "アトロピン・プラリドキシム（PAM）",
      isSpotlight: 0,
      mechanism: JSON.stringify([
        {
          step: 1,
          title: "AChE への共有結合",
          description:
            "サリンはアセチルコリンエステラーゼの活性部位セリン残基とリン酸エステル結合を形成し、酵素を不可逆的に阻害する。",
        },
        {
          step: 2,
          title: "アセチルコリンの蓄積",
          description:
            "AChEが機能しなくなることで、シナプス間隙にアセチルコリンが異常蓄積し、受容体が過剰刺激される。",
        },
        {
          step: 3,
          title: "全身のコリン作動性クリーゼ",
          description:
            "縮瞳・流涎・気管支収縮（ムスカリン作用）と筋線維束性収縮・麻痺（ニコチン作用）が同時に現れ、呼吸不全で死亡する。",
        },
      ]),
      tagSlugs: ["neurotoxin", "chemistry-tag"],
    },
    {
      slug: "muscarine",
      nameJa: "ムスカリン",
      nameEn: "Muscarine",
      categorySlug: "plant",
      emoji: "🍄",
      dangerLevel: 3,
      description:
        "毒キノコ（特にベニテングタケ・ドクツルタケ）に含まれるアルカロイド。副交感神経のムスカリン受容体を刺激し、消化器・心臓・分泌腺に強い影響を与える。",
      molecularFormula: "C₉H₂₀NO₂⁺",
      molecularWeight: 174.26,
      ld50: "0.23 mg/kg（マウス静脈内）",
      toxinClass: "アルカロイド",
      target: "ムスカリン性アセチルコリン受容体（mAChR）",
      producingOrganism: "ベニテングタケ・ドクツルタケなど",
      antidote: "アトロピン（ムスカリン受容体拮抗薬）",
      isSpotlight: 0,
      mechanism: null,
      tagSlugs: ["mushroom", "alkaloid"],
    },
    {
      slug: "coniine",
      nameJa: "コニイン",
      nameEn: "Coniine",
      categorySlug: "plant",
      emoji: "🌿",
      dangerLevel: 4,
      description:
        "ドクニンジン（コニウム）に含まれるアルカロイド。ニコチン性アセチルコリン受容体を阻害し上行性麻痺をきたす。BC 399年、哲学者ソクラテスの処刑に用いられた毒として歴史的に有名。",
      molecularFormula: "C₈H₁₇N",
      molecularWeight: 127.23,
      ld50: "100 mg/kg（マウス経口）",
      toxinClass: "ピペリジンアルカロイド",
      target: "ニコチン性アセチルコリン受容体（nAChR）",
      producingOrganism: "ドクニンジン（Conium maculatum）",
      antidote: "なし（対症療法）",
      isSpotlight: 0,
      mechanism: null,
      tagSlugs: ["hemlock", "alkaloid", "ancient-greece"],
    },
    {
      slug: "abrin",
      nameJa: "アブリン",
      nameEn: "Abrin",
      categorySlug: "plant",
      emoji: "🔴",
      dangerLevel: 5,
      description:
        "トウアズキ（Abrus precatorius）の種子に含まれる猛毒タンパク質。リシンと同様のリボソーム不活化機序を持ち、毒性はリシンに匹敵する。",
      molecularFormula: "タンパク質（65 kDa）",
      molecularWeight: 65000,
      ld50: "0.7 μg/kg（マウス腹腔内）",
      toxinClass: "タンパク質毒素（リボソーム不活化毒素）",
      target: "リボソーム 28S rRNA",
      producingOrganism: "トウアズキ（Abrus precatorius）",
      antidote: "なし（対症療法）",
      isSpotlight: 0,
      mechanism: null,
      tagSlugs: ["protein-toxin"],
    },
    {
      slug: "alpha-bungarotoxin",
      nameJa: "α-ブンガロトキシン",
      nameEn: "α-Bungarotoxin",
      categorySlug: "animal",
      emoji: "🐍",
      dangerLevel: 4,
      description:
        "アマガサヘビ（Bungarus multicinctus）の毒腺から分離されるポリペプチド毒素。神経筋接合部のニコチン性アセチルコリン受容体に不可逆的に結合し、弛緩性麻痺を引き起こす。",
      molecularFormula: "ポリペプチド（74 残基）",
      molecularWeight: 7980,
      ld50: "0.12 mg/kg（マウス静脈内）",
      toxinClass: "ポリペプチド毒素（3フィンガー毒素）",
      target: "ニコチン性アセチルコリン受容体（nAChR）",
      producingOrganism: "アマガサヘビ（Bungarus multicinctus）",
      antidote: "抗ヘビ毒血清",
      isSpotlight: 0,
      mechanism: null,
      tagSlugs: ["snake-venom", "neurotoxin"],
    },
    {
      slug: "palytoxin",
      nameJa: "パリトキシン",
      nameEn: "Palytoxin",
      categorySlug: "animal",
      emoji: "🪸",
      dangerLevel: 5,
      description:
        "サンゴや一部の海洋生物が産生する、非タンパク質毒素の中で最強クラスの毒物。Na⁺/K⁺-ATPase（ナトリウムポンプ）を恒常的に開いた状態にすることで細胞を破壊する。",
      molecularFormula: "C₁₂₉H₂₂₃N₃O₅₄",
      molecularWeight: 2677.5,
      ld50: "0.025 μg/kg（マウス静脈内）",
      toxinClass: "非タンパク質毒素",
      target: "Na⁺/K⁺-ATPase（ナトリウムポンプ）",
      producingOrganism: "ズパランサンゴ（Palythoa）・渦鞭毛藻",
      antidote: "なし（対症療法）",
      isSpotlight: 0,
      mechanism: null,
      tagSlugs: ["neurotoxin", "ion-channel"],
    },
  ];

  for (const t of toxinData) {
    const { tagSlugs, categorySlug, mechanism, ...rest } = t;
    const [inserted] = await db
      .insert(toxins)
      .values({
        ...rest,
        categoryId: catMap[categorySlug]!,
        mechanism: mechanism ?? null,
      })
      .onConflictDoNothing()
      .returning({ id: toxins.id });

    if (inserted && tagSlugs.length > 0) {
      const tagValues = tagSlugs
        .map((s) => tagMap[s])
        .filter((id): id is number => id !== undefined)
        .map((tagId) => ({ toxinId: inserted.id, tagId }));
      if (tagValues.length > 0) {
        await db.insert(toxinTags).values(tagValues).onConflictDoNothing();
      }
    }
  }

  // ─── articles ─────────────────────────────────────────────────────────────
  console.log("  → articles");
  const articleData = [
    {
      slug: "how-to-read-ld50",
      title: "LD₅₀の読み方入門——毒性の強さを数字で理解する",
      category: "chemistry",
      emoji: "🦠",
      excerpt:
        "「毒の強さ」を科学的に測る指標 LD₅₀（半数致死量）。その意味・限界・比較表を初心者向けに丁寧に解説します。",
      content: `# LD₅₀の読み方入門

## LD₅₀とは何か

LD₅₀（Lethal Dose 50%）とは、投与した試験動物の50%が死亡する用量のことです。
毒性を数値で比較するための国際的な指標として広く使われています。

## 読み方

LD₅₀は通常「mg/kg」または「μg/kg」で表記されます。

- **数値が小さいほど毒性が強い**（少ない量で致死）
- **数値が大きいほど毒性が弱い**（多い量でないと致死しない）

例：テトロドトキシン（TTX）のLD₅₀ = 10 μg/kg（マウス経口）
これは体重1kgあたり0.00001g（0.01mg）で半数が死亡することを意味します。

## 注意点

LD₅₀は毒性評価の参考値であり、以下の限界があります：

1. **種差**：マウスとヒトでは感受性が異なる
2. **投与経路**：経口・静脈内・皮膚では吸収率が大きく異なる
3. **急性毒性のみ**：慢性毒性・発がん性は評価されない

## 主要毒素のLD₅₀比較

| 毒素 | LD₅₀ | 経路 |
|------|------|------|
| ボツリヌス毒素 | 1 ng/kg | 吸入 |
| テトロドトキシン | 10 μg/kg | 経口 |
| アコニチン | 0.166 mg/kg | 静脈内 |
| サリン | 1.7 mg/kg | 皮膚 |

毒性の強さは「量が毒をつくる」というパラケルススの言葉を体現しています。`,
      publishedAt: "2026-04-10",
      tagSlugs: ["ld50", "chemistry-tag"],
    },
    {
      slug: "poison-dart-frog-diet",
      title: "ヤドクガエルはなぜ毒を持つのか——毒の「外部調達」という戦略",
      category: "animal",
      emoji: "🐸",
      excerpt:
        "自分で毒を作れないヤドクガエルが毒を持つ謎。食餌性毒素の蓄積という驚くべきメカニズムを解説します。",
      content: `# ヤドクガエルと食餌性毒素

## 毒を「食べる」動物

ヤドクガエル（Dendrobatidae科）は鮮やかな色彩を持ち、皮膚にバトラコトキシンやポンピドトキシンなどの猛毒を蓄積します。しかし興味深いことに、ヤドクガエル自身はこれらの毒を合成できません。

## 食餌性毒素蓄積のメカニズム

野生のヤドクガエルは毒性を持つアリやダニを食べることで、それらに含まれるアルカロイドを体内に蓄積します。

人工飼育下のヤドクガエルは、毒のない餌（コオロギなど）のみを与えられると、毒を持たなくなることが研究で確認されています。

## バトラコトキシン

ヤドクガエルに含まれる最も強力な毒の一つ、バトラコトキシン（BTX）は：

- Na⁺ チャネルを恒常的に活性化する
- LD₅₀ ≈ 2 μg/kg（マウス皮下）
- 先住民族が矢毒（吹き矢）に使用してきた歴史がある

## 「外部調達」戦略の意義

毒の外部調達は、進化的に見ても興味深い戦略です。
合成コストを節約しつつ、食物連鎖を通じて毒を獲得するこの仕組みは、
毒の進化を考える上での重要な事例です。`,
      publishedAt: "2026-04-07",
      tagSlugs: ["frog", "alkaloid"],
    },
    {
      slug: "victorian-arsenic-eaters",
      title: "ヴィクトリア朝の「砒素食い」——毒を好んで食べた人々",
      category: "history",
      emoji: "👑",
      excerpt:
        "19世紀ヨーロッパで砒素を体力増強剤として常用したスタイリア地方の農民たち。毒と文化の奇妙な交差点を辿ります。",
      content: `# ヴィクトリア朝の砒素食い

## 砒素を食べた人々

19世紀、オーストリアのスタイリア地方では農民たちが砒素（三酸化二ヒ素）を意図的に摂取していたという記録が残っています。

## 目的と信仰

- **体力増強**：山岳労働に耐えるスタミナのため
- **皮膚の美容**：肌が白くなると信じられていた
- **高地適応**：高地での呼吸を楽にするとされた

## パラケルススの「量が毒をつくる」

砒素の慢性摂取による耐性形成は、パラケルススの原則「量が毒をつくる」を体現する事例です。少量から徐々に量を増やすことで、致死量に近い砒素を摂取できるようになった者もいたとされます。

## 歴史的背景

ヴィクトリア朝時代、砒素は「毒薬の王」と呼ばれる一方で、美白化粧品・壁紙染料（エメラルドグリーン）・農薬として広く使われていました。ヒ素中毒による死は当時の法医学では検出困難で、多くの毒殺事件が見過ごされました。`,
      publishedAt: "2026-04-03",
      tagSlugs: ["history-tag", "culture"],
    },
    {
      slug: "toxic-ornamental-plants",
      title: "美しいほど危ない——観賞用植物に潜む毒10選",
      category: "plant",
      emoji: "🌺",
      excerpt:
        "スイセン・キョウチクトウ・ジギタリス…家庭の庭や公園にある身近な植物が持つ意外な毒性を紹介します。",
      content: `# 観賞用植物に潜む毒10選

## 1. スイセン（ナルキッソス）
鱗茎にリコリンというアルカロイドを多量に含む。タマネギと誤食される事故が毎年発生。

## 2. キョウチクトウ（オレアンダー）
オレアンドリンという強心配糖体を含む。すべての部位が有毒で、燃やした煙も危険。

## 3. ジギタリス（フォックスグローブ）
ジゴキシンなどの強心配糖体を含む。現在も心臓病の薬として利用されるが、治療域が狭く過量摂取で致死。

## 4. トリカブト（モンクスフード）
アコニチンを含む日本最強の毒草の一つ。山菜のニリンソウ・ヨモギと誤食される事故がある。

## 5. ヒガンバナ（リコリス）
リコリン・ガランタミンなどを含む。鱗茎は特に毒性が強い。

## 6. クリスマスローズ
ヘレボリン・プロトアネモニンなどを含む。触れただけで皮膚炎を起こすことがある。

## 7. ベラドンナ（ベラドンナ）
アトロピン・スコポラミンを含む。果実が甘くブドウに似ており誤食リスクが高い。

## 8. スズラン（コンバリア）
コンバラトキシンという強心配糖体を含む。生けた花瓶の水にも毒性がある。

## 9. チョウセンアサガオ（ダチュラ）
スコポラミン・アトロピンを含む。種子・葉に猛毒があり、幻覚・錯乱を引き起こす。

## 10. キョウチクトウ科のプルメリア
微量のアルカロイドを含む。沖縄・南国のイメージとは裏腹に要注意。`,
      publishedAt: "2026-03-28",
      tagSlugs: ["monkshood", "alkaloid", "belladonna"],
    },
    {
      slug: "conotoxin-to-ziconotide",
      title: "毒から生まれた薬——コノトキシン・ジコノチドの奇跡",
      category: "medicine",
      emoji: "💊",
      excerpt:
        "イモガイの猛毒に含まれるコノトキシンが、モルヒネの1000倍の鎮痛効果を持つ薬として誕生するまでの研究史。",
      content: `# コノトキシンからジコノチドへ

## イモガイの毒

イモガイ（Conus属）は美しい貝殻を持つ海産巻き貝ですが、毒針による刺傷で人が死亡する例も報告されています。

その毒成分「コノトキシン」は100種以上のペプチド毒素の混合物で、N型電位依存性カルシウムチャネルを選択的に阻害します。

## 研究から薬へ

フィリピン系米国人科学者バルドメロ・オリベラ博士が1970年代からコノトキシンの研究を開始。その中の一成分「ω-コノトキシンMVIIA」が鎮痛効果を持つことを発見しました。

20年以上の研究の末、2004年に米FDAが**ジコノチド（商品名: Prialt）**として承認。

## ジコノチドの特徴

- モルヒネの**1000倍の鎮痛効果**
- 脊髄くも膜下腔内投与（硬膜内ポンプ使用）
- 依存性・耐性がない
- がん性疼痛・慢性難治性疼痛に適応

## 毒と薬の境界

この事例は「毒と薬は紙一重」というパラケルススの格言を現代医学が実証した最良の例の一つです。他にも多くの毒が薬として研究されています。`,
      publishedAt: "2026-03-20",
      tagSlugs: ["neurotoxin", "medicine", "ion-channel"],
    },
    {
      slug: "poison-in-literature",
      title: "「毒」の文学——シェイクスピアからアガサ・クリスティまで",
      category: "culture",
      emoji: "🎭",
      excerpt:
        "ロミオとジュリエット、ハムレット、名探偵ポアロ…文学・ミステリに登場する毒の種類と史実との比較を読み解きます。",
      content: `# 文学の中の毒

## シェイクスピアの毒

シェイクスピアの作品には毒が頻繁に登場します。

**ロミオとジュリエット**：ジュリエットが飲む「死んだように眠る薬」はベラドンナ由来のスコポラミンではないかとされます。

**ハムレット**：父王の耳に注がれた毒はヘンバネ（ヒヨスチン）またはヒ素系化合物と考えられます。

## アガサ・クリスティと毒

「ミステリの女王」アガサ・クリスティは薬局で働いた経験を持ち、毒に関する正確な知識を作品に反映させました。

- **砒素**（ブラウン神父もの）
- **アコニチン**（トリカブト毒）
- **ニコチン**（超高濃度）
- **タリウム**（遅効性金属毒）

クリスティ作品には実際に毒殺に使われた方法が描かれており、犯罪捜査に役立ったとも言われます。

## 毒と文学の関係

古来より毒は：
- 権力・陰謀・秘密の象徴
- 弱者が強者に対抗する手段
- 科学と迷信の境界線

として文学に描かれてきました。文学の中の毒を追うことは、その時代の科学水準と社会構造を映す鏡でもあります。`,
      publishedAt: "2026-03-15",
      tagSlugs: ["history-tag", "culture"],
    },
  ];

  for (const a of articleData) {
    const { tagSlugs, ...rest } = a;
    const [inserted] = await db
      .insert(articles)
      .values(rest)
      .onConflictDoNothing()
      .returning({ id: articles.id });

    if (inserted && tagSlugs.length > 0) {
      const tagValues = tagSlugs
        .map((s) => tagMap[s])
        .filter((id): id is number => id !== undefined)
        .map((tagId) => ({ articleId: inserted.id, tagId }));
      if (tagValues.length > 0) {
        await db.insert(articleTags).values(tagValues).onConflictDoNothing();
      }
    }
  }

  // ─── history_events ───────────────────────────────────────────────────────
  console.log("  → history_events");
  await db
    .insert(historyEvents)
    .values([
      {
        year: "BC 399",
        yearSort: -399,
        title: "ソクラテス、ドクニンジンで処刑",
        description:
          "古代ギリシャの哲学者ソクラテスが毒人参（コニイン）を含む「毒の杯」を飲み死刑に処される。毒と政治・思想の交差点として哲学史に刻まれた事件。",
        tag: "culture",
      },
      {
        year: "BC 50頃",
        yearSort: -50,
        title: "ミトリダテス6世、「毒耐性」の試みを記録",
        description:
          "黒海沿岸の王ミトリダテスが毒殺を恐れ、少量の毒を毎日服用して耐性をつけたとされる。この実践は「ミトリダティスム」として後世に伝わる。",
        tag: "medicine",
      },
      {
        year: "1 世紀",
        yearSort: 1,
        title: "ディオスコリデス『薬物誌』を著す",
        description:
          "ギリシャの医師ディオスコリデスが600種以上の薬草・毒草を体系的に記録した『薬物誌（De Materia Medica）』を執筆。毒と薬の境界を初めて科学的に論じた書物。",
        tag: "science",
      },
      {
        year: "1538",
        yearSort: 1538,
        title: "パラケルスス「量が毒をつくる」",
        description:
          "スイスの錬金術師・医師パラケルススが「すべての物質は毒であり、毒でない物質はない。量が毒をつくる（The dose makes the poison）」と提唱。毒理学の根本概念が生まれる。",
        tag: "science",
      },
      {
        year: "1978",
        yearSort: 1978,
        title: "リシン入り傘事件（ブルガリア傘）",
        description:
          "ロンドンでブルガリアの反体制亡命者ゲオルギ・マルコフが傘の先端から発射したリシン入り鉛粒で暗殺される。植物毒素を使った現代の暗殺事件として世界を震撼させた。",
        tag: "incident",
      },
      {
        year: "2002",
        yearSort: 2002,
        title: "ボツリヌス毒素、美容医療に承認（米FDA）",
        description:
          "地球上で最も毒性の高い物質の一つであるボツリヌストキシンが、眉間のしわ治療薬「ボトックス」として米FDAの承認を受ける。毒が薬に転じた歴史的事例。",
        tag: "medicine",
      },
    ])
    .onConflictDoNothing();

  console.log("✅ Seeding complete!");
}
