import mysql from 'mysql2/promise';

let prodPool: mysql.Pool | undefined;
let testPool: mysql.Pool | undefined;

function createPool(database: string): mysql.Pool {
  return mysql.createPool({
    host:                  process.env.DB_HOST     || 'localhost',
    port:                  Number(process.env.DB_PORT || 3306),
    user:                  process.env.DB_USER     || 'root',
    password:              process.env.DB_PASS     || '',
    database,
    waitForConnections:    true,
    connectionLimit:       5,
    charset:               'utf8mb4',
    connectTimeout:        5000,
    enableKeepAlive:       true,
    keepAliveInitialDelay: 10000,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });
}

/** テスト環境かどうか判定（TEST_ENV 環境変数 または x-test-mode ヘッダー） */
export function isTestReq(req: Request): boolean {
  return process.env.TEST_ENV === 'true' || req.headers.get('x-test-mode') === 'true';
}

/** isTest=true のとき foresta_asama_test スキーマを使用 */
export function getDb(isTest = false): mysql.Pool {
  if (isTest) {
    testPool ??= createPool('foresta_asama_test');
    return testPool;
  }
  prodPool ??= createPool(process.env.DB_NAME || 'foresta_asama');
  return prodPool;
}

export async function runMigration(isTest = false): Promise<void> {
  const db = getDb(isTest);
  const tables = [
    `CREATE TABLE IF NOT EXISTS media (
      id          VARCHAR(36)   PRIMARY KEY,
      name        VARCHAR(255)  NOT NULL DEFAULT '',
      url         VARCHAR(1024) NOT NULL DEFAULT '',
      s3_key      VARCHAR(1024),
      type        VARCHAR(50)   DEFAULT 'image',
      category    VARCHAR(100)  DEFAULT '',
      size        VARCHAR(50)   DEFAULT '',
      upload_date DATETIME      DEFAULT CURRENT_TIMESTAMP,
      is_hero     TINYINT(1)    DEFAULT 0,
      sort_order  INT           DEFAULT 0,
      created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS page_layouts (
      section_key VARCHAR(200) PRIMARY KEY,
      image_urls  JSON         NOT NULL,
      updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS plans (
      id              VARCHAR(100) PRIMARY KEY,
      title_zh        VARCHAR(500) DEFAULT '',
      title_ja        VARCHAR(500) DEFAULT '',
      title_en        VARCHAR(500) DEFAULT '',
      desc_zh         TEXT,
      desc_ja         TEXT,
      desc_en         TEXT,
      duration        INT          DEFAULT 1,
      price           VARCHAR(100) DEFAULT '',
      tag_zh          VARCHAR(500) DEFAULT '',
      tag_ja          VARCHAR(500) DEFAULT '',
      tag_en          VARCHAR(500) DEFAULT '',
      highlights_zh   JSON,
      highlights_ja   JSON,
      highlights_en   JSON,
      cover_image     VARCHAR(1024) DEFAULT '',
      visible         TINYINT(1)   DEFAULT 1,
      sort_order      INT          DEFAULT 0,
      created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS users (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      username      VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role          VARCHAR(50)  DEFAULT 'admin',
      created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS plan_highlights (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      plan_id         VARCHAR(100) NOT NULL,
      sort_order      INT          DEFAULT 0,
      title_zh        VARCHAR(500) DEFAULT '',
      title_ja        VARCHAR(500) DEFAULT '',
      title_en        VARCHAR(500) DEFAULT '',
      description_zh  TEXT,
      description_ja  TEXT,
      description_en  TEXT,
      image_url       VARCHAR(1024) DEFAULT '',
      created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_plan_id (plan_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS plan_days (
      id                INT AUTO_INCREMENT PRIMARY KEY,
      plan_id           VARCHAR(100) NOT NULL,
      day_number        INT          NOT NULL,
      title_zh          VARCHAR(500) DEFAULT '',
      title_ja          VARCHAR(500) DEFAULT '',
      title_en          VARCHAR(500) DEFAULT '',
      activities_zh     JSON,
      activities_ja     JSON,
      activities_en     JSON,
      meal_morning_zh   VARCHAR(500) DEFAULT '',
      meal_morning_ja   VARCHAR(500) DEFAULT '',
      meal_morning_en   VARCHAR(500) DEFAULT '',
      meal_lunch_zh     VARCHAR(500) DEFAULT '',
      meal_lunch_ja     VARCHAR(500) DEFAULT '',
      meal_lunch_en     VARCHAR(500) DEFAULT '',
      meal_dinner_zh    VARCHAR(500) DEFAULT '',
      meal_dinner_ja    VARCHAR(500) DEFAULT '',
      meal_dinner_en    VARCHAR(500) DEFAULT '',
      INDEX idx_plan_id (plan_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS plan_budget_items (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      plan_id      VARCHAR(100) NOT NULL,
      sort_order   INT          DEFAULT 0,
      category_zh  VARCHAR(200) DEFAULT '',
      category_ja  VARCHAR(200) DEFAULT '',
      category_en  VARCHAR(200) DEFAULT '',
      amount       VARCHAR(100) DEFAULT '',
      note_zh      TEXT,
      note_ja      TEXT,
      note_en      TEXT,
      INDEX idx_plan_id (plan_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS contact_info (
      id              INT          PRIMARY KEY DEFAULT 1,
      phone           VARCHAR(100) DEFAULT '',
      phone_visible   TINYINT(1)   DEFAULT 1,
      email           VARCHAR(255) DEFAULT '',
      email_visible   TINYINT(1)   DEFAULT 1,
      line_id         VARCHAR(100) DEFAULT '',
      line_qr_url     VARCHAR(1024) DEFAULT '',
      line_visible    TINYINT(1)   DEFAULT 1,
      wechat_id       VARCHAR(100) DEFAULT '',
      wechat_qr_url   VARCHAR(1024) DEFAULT '',
      wechat_visible  TINYINT(1)   DEFAULT 1,
      updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS surroundings_spots (
      id              VARCHAR(100)  PRIMARY KEY,
      category        VARCHAR(50)   DEFAULT 'nature',
      name_zh         VARCHAR(500)  DEFAULT '',
      name_ja         VARCHAR(500)  DEFAULT '',
      name_en         VARCHAR(500)  DEFAULT '',
      description_zh  TEXT,
      description_ja  TEXT,
      description_en  TEXT,
      distance        INT           DEFAULT 0,
      image_url       VARCHAR(1024) DEFAULT '',
      tags_zh         JSON,
      tags_ja         JSON,
      tags_en         JSON,
      visible         TINYINT(1)   DEFAULT 1,
      sort_order      INT           DEFAULT 0,
      created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ];

  for (const sql of tables) {
    await db.query(sql);
  }

  // Fix media.size column: BIGINT → VARCHAR(50) (code stores formatted strings like "1.5 MB")
  await db.query(
    `ALTER TABLE media MODIFY COLUMN size VARCHAR(50) DEFAULT ''`,
  ).catch(() => {}); // ignore if already correct type

  // Extend plan_budget_items with per-language amount/currency columns
  const budgetCols: [string, string][] = [
    ['amount_zh',   "VARCHAR(100) DEFAULT ''"],
    ['currency_zh', "VARCHAR(10)  DEFAULT 'CNY'"],
    ['amount_ja',   "VARCHAR(100) DEFAULT ''"],
    ['currency_ja', "VARCHAR(10)  DEFAULT 'JPY'"],
    ['amount_en',   "VARCHAR(100) DEFAULT ''"],
    ['currency_en', "VARCHAR(10)  DEFAULT 'USD'"],
  ];
  const dbName = isTest ? 'foresta_asama_test' : (process.env.DB_NAME || 'foresta_asama');
  for (const [col, colType] of budgetCols) {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'plan_budget_items' AND COLUMN_NAME = ?`,
      [dbName, col],
    ) as any[][];
    if (rows[0].cnt === 0) {
      await db.query(`ALTER TABLE plan_budget_items ADD COLUMN ${col} ${colType}`);
    }
  }

  // Migrate old `amount` column data → new per-language columns (one-time, idempotent)
  await db.query(`
    UPDATE plan_budget_items
    SET amount_zh = amount, amount_ja = amount, amount_en = amount
    WHERE amount IS NOT NULL AND amount != ''
      AND (amount_zh IS NULL OR amount_zh = '')
  `).catch(() => {});

  // Extend plans table with new columns — MySQL 5.7 compatible (no ADD COLUMN IF NOT EXISTS)
  const newColumns: [string, string][] = [
    ['prestige_zh',           'TEXT'],
    ['prestige_ja',           'TEXT'],
    ['prestige_en',           'TEXT'],
    ['accommodation_images',  'JSON'],
    ['conclusion_zh',         'TEXT'],
    ['conclusion_ja',         'TEXT'],
    ['conclusion_en',         'TEXT'],
  ];

  for (const [col, colType] of newColumns) {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'plans' AND COLUMN_NAME = ?`,
      [dbName, col],
    ) as any[][];
    if (rows[0].cnt === 0) {
      await db.query(`ALTER TABLE plans ADD COLUMN ${col} ${colType}`);
    }
  }

  // One-time: rewrite old direct S3 URLs → CloudFront URLs in all tables
  const cdn = process.env.CDN_DOMAIN || 'd143jkdkye8i79.cloudfront.net';
  const cdnBase = `https://${cdn}`;
  const s3Like = '%amazonaws.com%';

  // Simple VARCHAR columns
  for (const [tbl, col] of [
    ['media',              'url'],
    ['surroundings_spots', 'image_url'],
    ['plan_highlights',    'image_url'],
    ['contact_info',       'line_qr_url'],
    ['contact_info',       'wechat_qr_url'],
    ['plans',              'cover_image'],
  ] as [string, string][]) {
    await db.query(
      `UPDATE ${tbl} SET ${col} = CONCAT(?, '/', SUBSTRING_INDEX(${col}, 'amazonaws.com/', -1)) WHERE ${col} LIKE ?`,
      [cdnBase, s3Like],
    ).catch(() => {});
  }

  // JSON array columns: page_layouts.image_urls and plans.accommodation_images
  const [layouts] = await db.query('SELECT section_key, image_urls FROM page_layouts').catch(() => [[]] as any) as any[][];
  for (const row of layouts as any[]) {
    const urls: string[] = typeof row.image_urls === 'string' ? JSON.parse(row.image_urls) : (row.image_urls ?? []);
    const fixed = urls.map((u: string) => u.includes('amazonaws.com') ? `${cdnBase}/${u.split('amazonaws.com/').pop()}` : u);
    if (fixed.some((u, i) => u !== urls[i])) {
      await db.query('UPDATE page_layouts SET image_urls = ? WHERE section_key = ?', [JSON.stringify(fixed), row.section_key]).catch(() => {});
    }
  }
  const [plans] = await db.query('SELECT id, accommodation_images FROM plans WHERE accommodation_images IS NOT NULL').catch(() => [[]] as any) as any[][];
  for (const row of plans as any[]) {
    if (!row.accommodation_images) continue;
    const imgs: string[] = typeof row.accommodation_images === 'string' ? JSON.parse(row.accommodation_images) : row.accommodation_images;
    const fixed = imgs.map((u: string) => u.includes('amazonaws.com') ? `${cdnBase}/${u.split('amazonaws.com/').pop()}` : u);
    if (fixed.some((u, i) => u !== imgs[i])) {
      await db.query('UPDATE plans SET accommodation_images = ? WHERE id = ?', [JSON.stringify(fixed), row.id]).catch(() => {});
    }
  }

  console.log('[db] migration complete');
}

// ─── Seasons tables — created per-request with the correct DB (prod or test) ──

const SEASONS_DDL = [
  `CREATE TABLE IF NOT EXISTS seasons (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    season        ENUM('spring','summer','autumn','winter') NOT NULL,
    name_zh       VARCHAR(200) NOT NULL DEFAULT '',
    name_ja       VARCHAR(200) NOT NULL DEFAULT '',
    name_en       VARCHAR(200) NOT NULL DEFAULT '',
    desc_zh       TEXT,
    desc_ja       TEXT,
    desc_en       TEXT,
    access_zh     VARCHAR(300) DEFAULT '',
    access_ja     VARCHAR(300) DEFAULT '',
    access_en     VARCHAR(300) DEFAULT '',
    distance_min  INT          DEFAULT 0,
    is_featured   TINYINT(1)   DEFAULT 0,
    display_order INT          DEFAULT 0,
    is_active     TINYINT(1)   DEFAULT 1,
    created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS season_images (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    season_id     INT          NOT NULL,
    image_url     VARCHAR(500) NOT NULL DEFAULT '',
    s3_key        VARCHAR(500) DEFAULT '',
    alt_zh        VARCHAR(200) DEFAULT '',
    alt_ja        VARCHAR(200) DEFAULT '',
    alt_en        VARCHAR(200) DEFAULT '',
    is_main       TINYINT(1)   DEFAULT 0,
    display_order INT          DEFAULT 0,
    INDEX idx_season_id (season_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

export async function ensureSeasonsTables(isTest = false): Promise<void> {
  const db = getDb(isTest);
  for (const sql of SEASONS_DDL) {
    await db.query(sql);
  }
}

// ─── Season initial data — seeded once per DB when table is empty ─────────────

type SeasonKey = 'spring' | 'summer' | 'autumn' | 'winter';

interface SeedSpot {
  season: SeasonKey;
  nameZh: string; nameJa: string; nameEn: string;
  descZh: string; descJa: string; descEn: string;
  accessZh: string; accessJa: string; accessEn: string;
  distanceMin: number;
  isFeatured: boolean;
  displayOrder: number;
}

const DEFAULT_SEASONS: SeedSpot[] = [
  // ── 春 Spring ──────────────────────────────────────────────────────────────
  {
    season: 'spring', isFeatured: true, displayOrder: 0, distanceMin: 15,
    nameZh: '轻井泽王子购物广场', nameJa: '軽井沢・プリンスショッピングプラザ', nameEn: 'Karuizawa Prince Shopping Plaza',
    descZh: '日本最大规模的奥特莱斯之一，汇聚了超过220家品牌店铺，包括Gucci、Prada等顶级奢侈品牌。支持免税及微信支付，别墅距此约15分钟车程。',
    descJa: '国内最大級のアウトレットモール。グッチ・プラダ等の高級ブランドを含む220店舗以上が集結。免税・WeChat Pay対応。別荘から車で約15分。',
    descEn: "One of Japan's largest outlet malls with over 220 stores including Gucci and Prada. Tax-free shopping and WeChat Pay available. About 15 minutes from the villa.",
    accessZh: '距别墅约15分钟车程', accessJa: '別荘から車で約15分', accessEn: 'About 15 min by car from the villa',
  },
  {
    season: 'spring', isFeatured: true, displayOrder: 1, distanceMin: 10,
    nameZh: '星野温泉 蜻蜓之汤', nameJa: '星野温泉 トンボの湯', nameEn: 'Hoshinoya Onsen Tombo-no-yu',
    descZh: '轻井泽代表性的温泉设施。弱碱性泉质，被称为「美肌之汤」，深受女性旅客喜爱。距别墅仅约10分钟。',
    descJa: '軽井沢を代表する温泉施設。弱アルカリ性の泉質は「美人の湯」として女性に人気。別荘から約10分。',
    descEn: "Karuizawa's premier hot spring facility. The slightly alkaline water is known as a \"beauty spring.\" About 10 minutes from the villa.",
    accessZh: '距别墅约10分钟车程', accessJa: '別荘から車で約10分', accessEn: 'About 10 min by car from the villa',
  },
  {
    season: 'spring', isFeatured: false, displayOrder: 2, distanceMin: 20,
    nameZh: '白丝瀑布', nameJa: '白糸の滝', nameEn: 'Shiraito Falls',
    descZh: '细如白丝般倾泻而下的美丽瀑布，宽约70米，春季水量充沛。被指定为国家名胜及天然纪念物。',
    descJa: '白糸のように繊細に流れる幅約70mの美しい滝。春は水量が豊富で迫力満点。国の名勝・天然記念物に指定。',
    descEn: 'Beautiful waterfall flowing like white silk threads, about 70m wide. A national scenic spot and natural monument. Especially impressive in spring.',
    accessZh: '距别墅约20分钟车程', accessJa: '別荘から車で約20分', accessEn: 'About 20 min by car from the villa',
  },
  {
    season: 'spring', isFeatured: false, displayOrder: 3, distanceMin: 18,
    nameZh: '旧轻井泽银座商店街', nameJa: '旧軽井沢銀座', nameEn: 'Old Karuizawa Ginza',
    descZh: '轻井泽最具历史风情的购物街，两侧林立着珠宝、工艺品、咖啡馆等特色店铺。春天绿意盎然，悠闲漫步最为惬意。',
    descJa: '軽井沢らしい風情漂うショッピングストリート。宝石・工芸品・カフェなど個性豊かな店が並ぶ。春は新緑の中の散策が心地よい。',
    descEn: 'Karuizawa\'s most charming shopping street lined with jewelry, crafts, and cafes. A leisurely spring stroll amid fresh greenery is a must.',
    accessZh: '距别墅约18分钟车程', accessJa: '別荘から車で約18分', accessEn: 'About 18 min by car from the villa',
  },

  // ── 夏 Summer ──────────────────────────────────────────────────────────────
  {
    season: 'summer', isFeatured: true, displayOrder: 0, distanceMin: 15,
    nameZh: '轻井泽王子购物广场', nameJa: '軽井沢・プリンスショッピングプラザ', nameEn: 'Karuizawa Prince Shopping Plaza',
    descZh: '日本最大规模的奥特莱斯之一，汇聚了超过220家品牌店铺，包括Gucci、Prada等顶级奢侈品牌。支持免税及微信支付，别墅距此约15分钟车程。',
    descJa: '国内最大級のアウトレットモール。グッチ・プラダ等の高級ブランドを含む220店舗以上が集結。免税・WeChat Pay対応。別荘から車で約15分。',
    descEn: "One of Japan's largest outlet malls with over 220 stores including Gucci and Prada. Tax-free shopping and WeChat Pay available. About 15 minutes from the villa.",
    accessZh: '距别墅约15分钟车程', accessJa: '別荘から車で約15分', accessEn: 'About 15 min by car from the villa',
  },
  {
    season: 'summer', isFeatured: true, displayOrder: 1, distanceMin: 10,
    nameZh: '星野温泉 蜻蜓之汤', nameJa: '星野温泉 トンボの湯', nameEn: 'Hoshinoya Onsen Tombo-no-yu',
    descZh: '轻井泽代表性的温泉设施。弱碱性泉质，被称为「美肌之汤」，深受女性旅客喜爱。距别墅仅约10分钟。',
    descJa: '軽井沢を代表する温泉施設。弱アルカリ性の泉質は「美人の湯」として女性に人気。別荘から約10分。',
    descEn: "Karuizawa's premier hot spring facility. The slightly alkaline water is known as a \"beauty spring.\" About 10 minutes from the villa.",
    accessZh: '距别墅约10分钟车程', accessJa: '別荘から車で約10分', accessEn: 'About 10 min by car from the villa',
  },
  {
    season: 'summer', isFeatured: false, displayOrder: 2, distanceMin: 20,
    nameZh: '轻井泽高尔夫球场', nameJa: '軽井沢ゴルフ場', nameEn: 'Karuizawa Golf Course',
    descZh: '海拔约1000米的高原高尔夫球场，夏季气候凉爽宜人。多个球场可供选择，享受被绿意包围的高原高尔夫体验。',
    descJa: '標高約1000mの高原ゴルフ場。夏でも涼しく快適なプレーが楽しめる。複数コースが揃い、緑に囲まれた高原ゴルフを満喫できる。',
    descEn: 'Highland golf course at 1,000m elevation — cool and comfortable even in summer. Multiple courses available amid lush greenery.',
    accessZh: '距别墅约20分钟车程', accessJa: '別荘から車で約20分', accessEn: 'About 20 min by car from the villa',
  },
  {
    season: 'summer', isFeatured: false, displayOrder: 3, distanceMin: 12,
    nameZh: '轻井泽高原教堂', nameJa: '軽井沢高原教会', nameEn: 'Karuizawa Kogen Church',
    descZh: '坐落于白桦林中的浪漫石造教堂，夏季绿荫与教堂白墙相映成趣，是轻井泽极具代表性的风景。',
    descJa: '白樺林に佇むロマンティックな石造りの教会。夏の緑と白い外壁のコントラストが軽井沢らしい絶景を作り出す。',
    descEn: 'A romantic stone church nestled in a birch forest. The contrast of summer greenery against its white walls creates a quintessential Karuizawa scene.',
    accessZh: '距别墅约12分钟车程', accessJa: '別荘から車で約12分', accessEn: 'About 12 min by car from the villa',
  },

  // ── 秋 Autumn ──────────────────────────────────────────────────────────────
  {
    season: 'autumn', isFeatured: true, displayOrder: 0, distanceMin: 15,
    nameZh: '云场池（红叶名所）', nameJa: '雲場池（紅葉）', nameEn: 'Kumoba Pond (Autumn Foliage)',
    descZh: '秋季最值得一游的景点。池面倒映的绚烂红叶被誉为轻井泽最美的风景，每年10月中旬至11月初为最佳观赏期。别墅约15分钟可达。',
    descJa: '秋の必訪スポット。池面に映る燃えるような紅葉は軽井沢随一の絶景。例年10月中旬〜11月上旬が見頃。約15分。',
    descEn: 'The must-visit spot in autumn. The blazing foliage reflected in the pond is Karuizawa\'s most stunning scenery. Best viewed from mid-October to early November.',
    accessZh: '距别墅约15分钟车程', accessJa: '別荘から車で約15分', accessEn: 'About 15 min by car from the villa',
  },
  {
    season: 'autumn', isFeatured: true, displayOrder: 1, distanceMin: 15,
    nameZh: '轻井泽王子购物广场', nameJa: '軽井沢・プリンスショッピングプラザ', nameEn: 'Karuizawa Prince Shopping Plaza',
    descZh: '日本最大规模的奥特莱斯之一，汇聚了超过220家品牌店铺，包括Gucci、Prada等顶级奢侈品牌。支持免税及微信支付，别墅距此约15分钟车程。',
    descJa: '国内最大級のアウトレットモール。グッチ・プラダ等の高級ブランドを含む220店舗以上が集結。免税・WeChat Pay対応。別荘から車で約15分。',
    descEn: "One of Japan's largest outlet malls with over 220 stores including Gucci and Prada. Tax-free shopping and WeChat Pay available. About 15 minutes from the villa.",
    accessZh: '距别墅约15分钟车程', accessJa: '別荘から車で約15分', accessEn: 'About 15 min by car from the villa',
  },
  {
    season: 'autumn', isFeatured: true, displayOrder: 2, distanceMin: 10,
    nameZh: '星野温泉 蜻蜓之汤', nameJa: '星野温泉 トンボの湯', nameEn: 'Hoshinoya Onsen Tombo-no-yu',
    descZh: '轻井泽代表性的温泉设施。弱碱性泉质，被称为「美肌之汤」，深受女性旅客喜爱。距别墅仅约10分钟。',
    descJa: '軽井沢を代表する温泉施設。弱アルカリ性の泉質は「美人の湯」として女性に人気。別荘から約10分。',
    descEn: "Karuizawa's premier hot spring facility. The slightly alkaline water is known as a \"beauty spring.\" About 10 minutes from the villa.",
    accessZh: '距别墅约10分钟车程', accessJa: '別荘から車で約10分', accessEn: 'About 10 min by car from the villa',
  },
  {
    season: 'autumn', isFeatured: false, displayOrder: 3, distanceMin: 20,
    nameZh: '轻井泽酒窖', nameJa: '軽井沢ワインセラー', nameEn: 'Karuizawa Wine Cellar',
    descZh: '拥有百余年历史的酿酒厂，秋天正是葡萄收获的季节。可参观酒窖、品尝当地葡萄酒，体验轻井沢独特的酿酒文化。',
    descJa: '百年以上の歴史を持つワイナリー。秋はぶどうの収穫期。セラー見学やテイスティングで軽井沢のワイン文化を体験できる。',
    descEn: 'A winery with over a century of history. Autumn is harvest season — enjoy cellar tours and wine tastings to experience Karuizawa\'s winemaking culture.',
    accessZh: '距别墅约20分钟车程', accessJa: '別荘から車で約20分', accessEn: 'About 20 min by car from the villa',
  },

  // ── 冬 Winter ──────────────────────────────────────────────────────────────
  {
    season: 'winter', isFeatured: true, displayOrder: 0, distanceMin: 15,
    nameZh: '轻井泽王子酒店滑雪场', nameJa: '軽井沢プリンスホテルスキー場', nameEn: 'Karuizawa Prince Hotel Ski Resort',
    descZh: '从东京出发约70分钟即可抵达的便捷滑雪场，初学者专用坡道完善，附设滑雪学校与租赁服务。别墅距此约15分钟车程。',
    descJa: '東京から約70分でアクセスできるスキー場。初心者向けゲレンデが充実し、スクールとレンタルも完備。別荘から約15分。',
    descEn: 'Conveniently located just 70 minutes from Tokyo. Excellent beginner slopes with ski school and full rental equipment. About 15 minutes from the villa.',
    accessZh: '距别墅约15分钟车程', accessJa: '別荘から車で約15分', accessEn: 'About 15 min by car from the villa',
  },
  {
    season: 'winter', isFeatured: true, displayOrder: 1, distanceMin: 10,
    nameZh: '星野温泉 蜻蜓之汤（雪见露天浴）', nameJa: '星野温泉 トンボの湯（雪見露天）', nameEn: 'Hoshinoya Onsen Tombo-no-yu (Snow View)',
    descZh: '冬季限定的雪见露天温泉体验。一边泡汤，一边欣赏雪景，是轻井泽冬季最奢华的享受。距别墅约10分钟。',
    descJa: '冬季限定の雪見露天を楽しめる。湯に浸かりながら雪景色を眺める体験は軽井沢冬の最高の贅沢。別荘から約10分。',
    descEn: 'Winter-only snow-view open-air bath. Soaking in hot spring while gazing at snowscapes — the ultimate winter luxury in Karuizawa. About 10 minutes away.',
    accessZh: '距别墅约10分钟车程', accessJa: '別荘から車で約10分', accessEn: 'About 10 min by car from the villa',
  },
  {
    season: 'winter', isFeatured: false, displayOrder: 2, distanceMin: 15,
    nameZh: '轻井泽冰上公园', nameJa: 'アイスパーク（スケート）', nameEn: 'Karuizawa Ice Park',
    descZh: '轻井泽王子大饭店内的正式冰上运动场，冬季开放溜冰。可租借冰刀，适合全家老少同乐。',
    descJa: '軽井沢プリンスホテル内の本格的なアイスリンク。スケート靴のレンタルあり、家族みんなで楽しめる。',
    descEn: 'A full-size ice rink within the Karuizawa Prince Hotel. Skate rentals available — fun for the whole family.',
    accessZh: '距别墅约15分钟车程', accessJa: '別荘から車で約15分', accessEn: 'About 15 min by car from the villa',
  },
  {
    season: 'winter', isFeatured: false, displayOrder: 3, distanceMin: 12,
    nameZh: '轻井泽圣诞市集', nameJa: 'クリスマスマーケット', nameEn: 'Karuizawa Christmas Market',
    descZh: '以德国正宗圣诞市集为原型的冬季活动，在星野度假区举办。夜晚灯光璀璨，工艺品摊位与热葡萄酒营造出浓郁的节日气氛。',
    descJa: 'ドイツ本場のクリスマスマーケットをモデルにしたイベントが星野リゾートで開催。夜の光と手工芸品、グリューワインで祝祭ムードを満喫。',
    descEn: 'A German-style Christmas Market hosted at Hoshino Resort. Evening lights, handcrafts, and mulled wine create a festive winter atmosphere.',
    accessZh: '距别墅约12分钟车程', accessJa: '別荘から車で約12分', accessEn: 'About 12 min by car from the villa',
  },
  {
    season: 'winter', isFeatured: false, displayOrder: 4, distanceMin: 15,
    nameZh: '轻井泽王子购物广场', nameJa: '軽井沢・プリンスショッピングプラザ', nameEn: 'Karuizawa Prince Shopping Plaza',
    descZh: '日本最大规模的奥特莱斯之一，汇聚了超过220家品牌店铺，包括Gucci、Prada等顶级奢侈品牌。支持免税及微信支付，别墅距此约15分钟车程。',
    descJa: '国内最大級のアウトレットモール。グッチ・プラダ等の高級ブランドを含む220店舗以上が集結。免税・WeChat Pay対応。別荘から車で約15分。',
    descEn: "One of Japan's largest outlet malls with over 220 stores including Gucci and Prada. Tax-free shopping and WeChat Pay available. About 15 minutes from the villa.",
    accessZh: '距别墅约15分钟车程', accessJa: '別荘から車で約15分', accessEn: 'About 15 min by car from the villa',
  },
];

export async function seedSeasonsIfEmpty(isTest = false): Promise<void> {
  const db = getDb(isTest);
  const [rows] = await db.query('SELECT COUNT(*) AS cnt FROM seasons') as any[][];
  if (rows[0].cnt > 0) return;
  for (const s of DEFAULT_SEASONS) {
    await db.query(
      `INSERT INTO seasons
         (season, name_zh, name_ja, name_en, desc_zh, desc_ja, desc_en,
          access_zh, access_ja, access_en, distance_min, is_featured, display_order, is_active)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1)`,
      [
        s.season, s.nameZh, s.nameJa, s.nameEn,
        s.descZh, s.descJa, s.descEn,
        s.accessZh, s.accessJa, s.accessEn,
        s.distanceMin, s.isFeatured ? 1 : 0, s.displayOrder,
      ],
    );
  }
  console.log('[db] seasons seeded with', DEFAULT_SEASONS.length, 'spots');
}

// Default surroundings spots — seeded once when table is empty
const DEFAULT_SPOTS = [
  { id: 'shiraito',     category: 'nature',   nameZh: '白丝瀑布',         nameJa: '白糸の滝',             nameEn: 'Shiraito Falls',
    descZh: '日本三大瀑布之一，如白丝般细腻流淌的美丽瀑布，四季各有不同魅力。',
    descJa: '日本三大瀑布のひとつ、白糸のように繊細に流れる美しい滝で、四季それぞれに異なる魅力があります。',
    descEn: "One of Japan's three great waterfalls, flowing delicately like white silk with unique charm in each season.",
    distance: 15, tagsZh: ['自然景观','徒步'], tagsJa: ['自然景観','ハイキング'], tagsEn: ['Natural Scenery','Hiking'], sort: 0 },
  { id: 'asama',        category: 'nature',   nameZh: '浅间山',           nameJa: '浅間山',               nameEn: 'Mt. Asama',
    descZh: '日本最活跃的火山之一，雄伟的姿态与神秘的云雾构成绝美的自然景观。',
    descJa: '日本で最も活発な火山のひとつで、雄大な姿と神秘的な霧が絶美な自然景観を作り出しています。',
    descEn: "One of Japan's most active volcanoes, its majestic form and mysterious mist create a breathtaking natural landscape.",
    distance: 5,  tagsZh: ['火山景观','摄影'],  tagsJa: ['火山景観','写真'],      tagsEn: ['Volcanic Scenery','Photography'], sort: 1 },
  { id: 'kumoba',       category: 'nature',   nameZh: '云场池',           nameJa: '雲場池',               nameEn: 'Kumoba Pond',
    descZh: '被誉为"轻井泽之眼"，秋季红叶倒映水中，如诗如画。',
    descJa: '「軽井沢の瞳」と称されるこの池は、秋の紅葉が水面に映り、詩のような絵画のような美しさです。',
    descEn: 'Known as the "Eye of Karuizawa", autumn foliage reflected on the water creates a poetic, painting-like beauty.',
    distance: 8,  tagsZh: ['季节景色','散步'],  tagsJa: ['季節の景色','散歩'],   tagsEn: ['Seasonal Scenery','Walking'], sort: 2 },
  { id: 'stone-church', category: 'culture',  nameZh: '石之教堂',         nameJa: '石の教会',             nameEn: 'Stone Church',
    descZh: '建筑师肯德里克·班斯的杰作，以自然石材和玻璃构成的现代主义教堂，与自然融为一体。',
    descJa: '建築家ケンドリック・バンスの傑作で、天然石とガラスで構成されたモダニズムの教会が自然と一体化しています。',
    descEn: 'A masterpiece by architect Kendrick Bangs, this modernist church of natural stone and glass merges with nature.',
    distance: 10, tagsZh: ['建筑艺术','文化遗产'], tagsJa: ['建築芸術','文化遺産'], tagsEn: ['Architecture','Cultural Heritage'], sort: 3 },
  { id: 'sezon-museum', category: 'culture',  nameZh: '軽井泽现代美术馆', nameJa: '軽井沢現代美術館',   nameEn: 'Karuizawa Museum of Modern Art',
    descZh: '收藏包括毕加索、达利等世界名家作品，森林包围中的艺术殿堂。',
    descJa: 'ピカソやダリなどの世界的巨匠の作品を収蔵する、森に囲まれた芸術の殿堂です。',
    descEn: 'Housing works by world masters including Picasso and Dali, an art temple surrounded by forest.',
    distance: 12, tagsZh: ['艺术','室内景点'], tagsJa: ['芸術','屋内スポット'], tagsEn: ['Art','Indoor Attraction'], sort: 4 },
  { id: 'ginza',        category: 'shopping', nameZh: '旧银座商店街',     nameJa: '旧軽銀座商店街',       nameEn: 'Old Ginza Shopping Street',
    descZh: '拥有百年历史的购物街，汇集了轻井泽知名品牌、工艺品和特色美食，漫步其中感受轻井泽的悠久历史。',
    descJa: '百年の歴史を誇るショッピングストリートで、軽井沢の有名ブランド、工芸品、特色グルメが集まっています。',
    descEn: "A shopping street with centennial history, gathering Karuizawa's famous brands, crafts, and specialty foods.",
    distance: 10, tagsZh: ['购物','特产'], tagsJa: ['ショッピング','特産品'], tagsEn: ['Shopping','Local Specialties'], sort: 5 },
  { id: 'hoshino-onsen',category: 'activity', nameZh: '星野温泉蜻蜓之汤', nameJa: '星野温泉 とんぼの湯', nameEn: 'Hoshino Onsen Tonbo-no-yu',
    descZh: '轻井泽最负盛名的温泉设施，泡汤同时欣赏森林美景，彻底放松身心。',
    descJa: '軽井沢で最も有名な温泉施設で、森の美景を眺めながら入浴し、心身を完全にリラックスできます。',
    descEn: "Karuizawa's most famous onsen facility, relax completely while enjoying forest views.",
    distance: 5,  tagsZh: ['温泉','放松'], tagsJa: ['温泉','リラクゼーション'], tagsEn: ['Onsen','Relaxation'], sort: 6 },
  { id: 'harunire',     category: 'shopping', nameZh: '榆树街小镇',       nameJa: 'ハルニレテラス',       nameEn: 'Harunire Terrace',
    descZh: '依偎在古老榆树群中的精品商业空间，包含餐厅、咖啡馆和精选商店，是轻井泽最受欢迎的休闲场所之一。',
    descJa: '古いハルニレの木立に囲まれたブティック商業空間で、レストラン、カフェ、厳選ショップを含む軽井沢で最人気の憩いの場です。',
    descEn: 'A boutique commercial space nestled among old elm trees, featuring restaurants, cafes, and selected shops.',
    distance: 5,  tagsZh: ['购物','餐饮'], tagsJa: ['ショッピング','グルメ'], tagsEn: ['Shopping','Dining'], sort: 7 },
  { id: 'gourmet-french', category: 'gourmet', nameZh: '轻井泽法式餐厅', nameJa: '軽井沢フレンチレストラン', nameEn: 'Karuizawa French Restaurant',
    descZh: '汇聚日本顶级法式料理大师，在轻井泽的自然环境中享受一流的欧陆风情。',
    descJa: '日本トップクラスのフレンチシェフが集まり、軽井沢の自然環境の中でトップクラスのヨーロッパ料理を楽しめます。',
    descEn: "Gathering Japan's top French cuisine masters, enjoy first-class European cuisine in Karuizawa's natural setting.",
    distance: 8,  tagsZh: ['法式料理','高端餐饮'], tagsJa: ['フレンチ','高級グルメ'], tagsEn: ['French Cuisine','Fine Dining'], sort: 8 },
];

export async function seedSurroundingsIfEmpty(): Promise<void> {
  const db = getDb();
  const [rows] = await db.query('SELECT COUNT(*) AS cnt FROM surroundings_spots') as any[][];
  if (rows[0].cnt > 0) return;
  for (const s of DEFAULT_SPOTS) {
    await db.query(
      `INSERT IGNORE INTO surroundings_spots
         (id, category, name_zh, name_ja, name_en, description_zh, description_ja, description_en,
          distance, image_url, tags_zh, tags_ja, tags_en, visible, sort_order)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1,?)`,
      [s.id, s.category, s.nameZh, s.nameJa, s.nameEn,
       s.descZh, s.descJa, s.descEn, s.distance, '',
       JSON.stringify(s.tagsZh), JSON.stringify(s.tagsJa), JSON.stringify(s.tagsEn), s.sort],
    );
  }
  console.log('[db] surroundings_spots seeded');
}

// ─── Announcements ────────────────────────────────────────────────────────────

const SEASON_COVERS_DDL = `CREATE TABLE IF NOT EXISTS season_covers (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  season     ENUM('spring','summer','autumn','winter') NOT NULL,
  image_url  TEXT NOT NULL,
  s3_key     VARCHAR(512) NOT NULL DEFAULT '',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_season (season)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;

export async function ensureSeasonCoversTable(isTest = false): Promise<void> {
  const db = getDb(isTest);
  await db.query(SEASON_COVERS_DDL);
}

const ANNOUNCEMENTS_DDL = `CREATE TABLE IF NOT EXISTS announcements (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  message_cn     TEXT NOT NULL,
  message_ja     TEXT NOT NULL,
  message_en     TEXT NOT NULL,
  starts_at      DATETIME NOT NULL,
  ends_at        DATETIME DEFAULT NULL,
  is_active      TINYINT(1) DEFAULT 1,
  style_variant  ENUM('default','important') DEFAULT 'default',
  scroll_speed   INT DEFAULT 30,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;

export async function ensureAnnouncementsTable(isTest = false): Promise<void> {
  const db = getDb(isTest);
  await db.query(ANNOUNCEMENTS_DDL);
}

// ─── v3 Redesign Tables ───────────────────────────────────────────────────────

const V3_DDL = [
  `CREATE TABLE IF NOT EXISTS site_settings (
    setting_key VARCHAR(64) PRIMARY KEY,
    value_zh    TEXT,
    value_ja    TEXT,
    value_en    TEXT,
    value_raw   TEXT,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS hero_section (
    id                  INT PRIMARY KEY DEFAULT 1,
    background_image_url VARCHAR(500) DEFAULT '',
    eyebrow_zh          VARCHAR(200) DEFAULT '',
    eyebrow_ja          VARCHAR(200) DEFAULT '',
    eyebrow_en          VARCHAR(200) DEFAULT '',
    title_line1_zh      VARCHAR(200) DEFAULT '',
    title_line1_ja      VARCHAR(200) DEFAULT '',
    title_line1_en      VARCHAR(200) DEFAULT '',
    title_line2_zh      VARCHAR(200) DEFAULT '',
    title_line2_ja      VARCHAR(200) DEFAULT '',
    title_line2_en      VARCHAR(200) DEFAULT '',
    subtitle_zh         TEXT,
    subtitle_ja         TEXT,
    subtitle_en         TEXT,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS hero_stats (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    display_order INT DEFAULT 0,
    value_text    VARCHAR(64) DEFAULT '',
    label_zh      VARCHAR(100) DEFAULT '',
    label_ja      VARCHAR(100) DEFAULT '',
    label_en      VARCHAR(100) DEFAULT '',
    is_enabled    TINYINT(1) DEFAULT 1
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS flow_section (
    id         INT PRIMARY KEY DEFAULT 1,
    eyebrow_zh VARCHAR(200) DEFAULT '',
    eyebrow_ja VARCHAR(200) DEFAULT '',
    eyebrow_en VARCHAR(200) DEFAULT '',
    title_zh   VARCHAR(200) DEFAULT '',
    title_ja   VARCHAR(200) DEFAULT '',
    title_en   VARCHAR(200) DEFAULT '',
    subtitle_zh TEXT,
    subtitle_ja TEXT,
    subtitle_en TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS flow_steps (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    step_number     INT DEFAULT 0,
    step_label_zh   VARCHAR(100) DEFAULT '',
    step_label_ja   VARCHAR(100) DEFAULT '',
    step_label_en   VARCHAR(100) DEFAULT '',
    title_zh        VARCHAR(200) DEFAULT '',
    title_ja        VARCHAR(200) DEFAULT '',
    title_en        VARCHAR(200) DEFAULT '',
    description_zh  TEXT,
    description_ja  TEXT,
    description_en  TEXT,
    cta_label_zh    VARCHAR(100) DEFAULT '',
    cta_label_ja    VARCHAR(100) DEFAULT '',
    cta_label_en    VARCHAR(100) DEFAULT '',
    cta_url         VARCHAR(500) DEFAULT '',
    is_external     TINYINT(1) DEFAULT 0,
    display_order   INT DEFAULT 0,
    is_enabled      TINYINT(1) DEFAULT 1,
    UNIQUE KEY uk_step_number (step_number)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS seasons_meta (
    season        ENUM('spring','summer','autumn','winter') PRIMARY KEY,
    jp_label      VARCHAR(8) DEFAULT '',
    en_label      VARCHAR(32) DEFAULT '',
    sub_zh        VARCHAR(200) DEFAULT '',
    sub_ja        VARCHAR(200) DEFAULT '',
    sub_en        VARCHAR(200) DEFAULT '',
    caption_zh    TEXT,
    caption_ja    TEXT,
    caption_en    TEXT,
    main_image_url VARCHAR(500) DEFAULT '',
    display_order INT DEFAULT 0,
    is_enabled    TINYINT(1) DEFAULT 1,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS villas (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    villa_key     VARCHAR(32) UNIQUE,
    name_zh       VARCHAR(100) DEFAULT '',
    name_ja       VARCHAR(100) DEFAULT '',
    name_en       VARCHAR(100) DEFAULT '',
    spec_zh       VARCHAR(200) DEFAULT '',
    spec_ja       VARCHAR(200) DEFAULT '',
    spec_en       VARCHAR(200) DEFAULT '',
    tag_zh        VARCHAR(200) DEFAULT '',
    tag_ja        VARCHAR(200) DEFAULT '',
    tag_en        VARCHAR(200) DEFAULT '',
    description_zh TEXT,
    description_ja TEXT,
    description_en TEXT,
    main_image_url VARCHAR(500) DEFAULT '',
    display_order INT DEFAULT 0,
    is_enabled    TINYINT(1) DEFAULT 1
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS stay_plans (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    plan_key         VARCHAR(64) UNIQUE,
    tag_zh           VARCHAR(100) DEFAULT '',
    tag_ja           VARCHAR(100) DEFAULT '',
    tag_en           VARCHAR(100) DEFAULT '',
    step_number_text VARCHAR(8) DEFAULT '',
    title_zh         VARCHAR(200) DEFAULT '',
    title_ja         VARCHAR(200) DEFAULT '',
    title_en         VARCHAR(200) DEFAULT '',
    description_zh   TEXT,
    description_ja   TEXT,
    description_en   TEXT,
    price_text       VARCHAR(64) DEFAULT '',
    main_image_url   VARCHAR(500) DEFAULT '',
    cta_url          VARCHAR(500) DEFAULT '',
    is_external      TINYINT(1) DEFAULT 0,
    display_order    INT DEFAULT 0,
    is_enabled       TINYINT(1) DEFAULT 1
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS location_section (
    id              INT PRIMARY KEY DEFAULT 1,
    eyebrow_zh      VARCHAR(200) DEFAULT '',
    eyebrow_ja      VARCHAR(200) DEFAULT '',
    eyebrow_en      VARCHAR(200) DEFAULT '',
    title_zh        VARCHAR(200) DEFAULT '',
    title_ja        VARCHAR(200) DEFAULT '',
    title_en        VARCHAR(200) DEFAULT '',
    description_zh  TEXT,
    description_ja  TEXT,
    description_en  TEXT,
    address_zh      VARCHAR(500) DEFAULT '',
    address_ja      VARCHAR(500) DEFAULT '',
    address_en      VARCHAR(500) DEFAULT '',
    map_image_url   VARCHAR(500) DEFAULT '',
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS location_access (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    display_order INT DEFAULT 0,
    origin_zh     VARCHAR(100) DEFAULT '',
    origin_ja     VARCHAR(100) DEFAULT '',
    origin_en     VARCHAR(100) DEFAULT '',
    duration_zh   VARCHAR(100) DEFAULT '',
    duration_ja   VARCHAR(100) DEFAULT '',
    duration_en   VARCHAR(100) DEFAULT '',
    is_enabled    TINYINT(1) DEFAULT 1
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS cta_section (
    id                INT PRIMARY KEY DEFAULT 1,
    eyebrow_zh        VARCHAR(200) DEFAULT '',
    eyebrow_ja        VARCHAR(200) DEFAULT '',
    eyebrow_en        VARCHAR(200) DEFAULT '',
    title_line1_zh    VARCHAR(200) DEFAULT '',
    title_line1_ja    VARCHAR(200) DEFAULT '',
    title_line1_en    VARCHAR(200) DEFAULT '',
    title_line2_zh    VARCHAR(200) DEFAULT '',
    title_line2_ja    VARCHAR(200) DEFAULT '',
    title_line2_en    VARCHAR(200) DEFAULT '',
    subtitle_zh       TEXT,
    subtitle_ja       TEXT,
    subtitle_en       TEXT,
    primary_label_zh  VARCHAR(100) DEFAULT '',
    primary_label_ja  VARCHAR(100) DEFAULT '',
    primary_label_en  VARCHAR(100) DEFAULT '',
    primary_url       VARCHAR(500) DEFAULT '',
    secondary_label_zh VARCHAR(100) DEFAULT '',
    secondary_label_ja VARCHAR(100) DEFAULT '',
    secondary_label_en VARCHAR(100) DEFAULT '',
    secondary_url     VARCHAR(500) DEFAULT '',
    updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS home_sections (
    section_key   VARCHAR(32) PRIMARY KEY,
    display_order INT DEFAULT 0,
    is_enabled    TINYINT(1) DEFAULT 1
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS hero_slides (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    image_url     VARCHAR(500) NOT NULL DEFAULT '',
    alt_zh        VARCHAR(200) DEFAULT '',
    alt_ja        VARCHAR(200) DEFAULT '',
    alt_en        VARCHAR(200) DEFAULT '',
    display_order INT DEFAULT 0,
    is_enabled    TINYINT(1) DEFAULT 1
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS video_section (
    id          INT PRIMARY KEY DEFAULT 1,
    eyebrow_zh  VARCHAR(200) DEFAULT '',
    eyebrow_ja  VARCHAR(200) DEFAULT '',
    eyebrow_en  VARCHAR(200) DEFAULT '',
    title_zh    VARCHAR(200) DEFAULT '',
    title_ja    VARCHAR(200) DEFAULT '',
    title_en    VARCHAR(200) DEFAULT '',
    subtitle_zh TEXT,
    subtitle_ja TEXT,
    subtitle_en TEXT,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS featured_videos (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    title_zh        VARCHAR(200) DEFAULT '',
    title_ja        VARCHAR(200) DEFAULT '',
    title_en        VARCHAR(200) DEFAULT '',
    video_url       VARCHAR(500) NOT NULL DEFAULT '',
    thumbnail_url   VARCHAR(500) DEFAULT '',
    description_zh  TEXT,
    description_ja  TEXT,
    description_en  TEXT,
    display_order   INT DEFAULT 0,
    is_enabled      TINYINT(1) DEFAULT 1
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

const V3_SEEDS = {
  site_settings: [
    { setting_key: 'reservation_url',  value_raw: 'https://example-booking-system.com/foresta-asama', value_zh: null, value_ja: null, value_en: null },
    { setting_key: 'default_theme',    value_raw: 'onyx',  value_zh: null, value_ja: null, value_en: null },
    { setting_key: 'brand_name',       value_raw: null, value_zh: 'Foresta Asama', value_ja: 'Foresta Asama', value_en: 'Foresta Asama' },
    { setting_key: 'brand_tagline',    value_raw: null, value_zh: '轻井泽 · 浅间', value_ja: 'Karuizawa · Asama', value_en: 'Karuizawa · Asama' },
  ],
  hero_section: {
    eyebrow_zh: '轻井泽 · 浅间山麓', eyebrow_ja: '軽井沢 · 浅間山麓', eyebrow_en: 'Karuizawa · Mt. Asama',
    title_line1_zh: 'Terrace Villa', title_line1_ja: 'Terrace Villa', title_line1_en: 'Terrace Villa',
    title_line2_zh: 'Foresta Asama', title_line2_ja: 'Foresta Asama', title_line2_en: 'Foresta Asama',
    subtitle_zh: '树木与雾，柴火的香气。浅间的风穿过，轻井泽的私人别墅。',
    subtitle_ja: '樹々と霧、薪の香り。浅間の風が抜ける、軽井沢のプライベートヴィラ。',
    subtitle_en: 'Forests and mist, the scent of firewood. A private villa in Karuizawa where the Asama wind flows.',
  },
  hero_stats: [
    { step: 1, value_text: 'IV',      label_zh: '栋别墅',  label_ja: '棟のヴィラ',  label_en: 'Villas',       display_order: 0 },
    { step: 2, value_text: '1,000m',  label_zh: '海拔',    label_ja: '標高',        label_en: 'Elevation',    display_order: 1 },
    { step: 3, value_text: '24h',     label_zh: '管家服务', label_ja: 'バトラー',    label_en: 'Butler',       display_order: 2 },
    { step: 4, value_text: '71min',   label_zh: '距东京',  label_ja: '東京から',    label_en: 'From Tokyo',   display_order: 3 },
  ],
  flow_section: {
    eyebrow_zh: '预约流程', eyebrow_ja: 'ご予約までの流れ', eyebrow_en: 'How to Reserve',
    title_zh: '预约的三个步骤。', title_ja: 'ご予約までの、三つのステップ。', title_en: 'Three steps to your stay.',
    subtitle_zh: '了解、选择、入住。礼宾将为您的住宿提供帮助。',
    subtitle_ja: '知って、選んで、泊まる。コンシェルジュがあなたの滞在をお手伝いします。',
    subtitle_en: 'Discover, choose, and stay. Our concierge will assist your entire experience.',
  },
  flow_steps: [
    { step_number: 1, step_label_zh: '了解', step_label_ja: '知る', step_label_en: 'Discover',
      title_zh: '了解', title_ja: '知る', title_en: 'Discover',
      description_zh: '比较四栋别墅和季节的不同面貌。', description_ja: '四棟のヴィラと季節の表情を見比べる。', description_en: 'Compare the four villas and seasonal experiences.',
      cta_label_zh: '查看别墅', cta_label_ja: 'ヴィラを見る', cta_label_en: 'View Villas', cta_url: '/plans', is_external: 0, display_order: 0 },
    { step_number: 2, step_label_zh: '选择', step_label_ja: '選ぶ', step_label_en: 'Choose',
      title_zh: '选择', title_ja: '選ぶ', title_en: 'Choose',
      description_zh: '根据自己的生活方式选择住宿计划。', description_ja: '過ごし方に合わせて滞在プランを選ぶ。', description_en: 'Select the stay plan that suits your lifestyle.',
      cta_label_zh: '套餐列表', cta_label_ja: 'プラン一覧', cta_label_en: 'View Plans', cta_url: '/plans', is_external: 0, display_order: 1 },
    { step_number: 3, step_label_zh: '入住', step_label_ja: '泊まる', step_label_en: 'Stay',
      title_zh: '入住', title_ja: '泊まる', title_en: 'Stay',
      description_zh: '抵达后，管家将处理一切。', description_ja: '到着後はバトラーが全てを取り回す。', description_en: 'Upon arrival, your butler handles everything.',
      cta_label_zh: '立即预约', cta_label_ja: '予約に進む', cta_label_en: 'Reserve Now', cta_url: '', is_external: 1, display_order: 2 },
  ],
  seasons_meta: [
    { season: 'spring', jp_label: '春', en_label: 'Vernal',   display_order: 0,
      sub_zh: '山樱与山菜的早晨', sub_ja: '山桜と山菜の朝', sub_en: 'Mountain Cherry & Wild Herbs',
      caption_zh: '雪融溪流，嫩芽森林。在露台享用当地野菜和新茶。', caption_ja: '雪解けの渓流、芽吹きの森。地元の山菜と新茶を、テラスで。', caption_en: 'Snowmelt streams, budding forest. Local wild vegetables and new tea on the terrace.' },
    { season: 'summer', jp_label: '夏', en_label: 'Estival',  display_order: 1,
      sub_zh: '薄雾与高原的夜晚', sub_ja: '霧と高原の夜', sub_en: 'Mist & Highland Nights',
      caption_zh: '轻井泽特有的清凉微风和薄雾。在暖炉旁享用沐浴星光的晚餐。', caption_ja: '軽井沢らしい涼風と霧。星を抱えた夕食、暖炉と。', caption_en: 'The cool breeze and mist unique to Karuizawa. Dinner under the stars by the fireplace.' },
    { season: 'autumn', jp_label: '秋', en_label: 'Autumnal', display_order: 2,
      sub_zh: '红叶与柴火', sub_ja: '紅葉と薪火', sub_en: 'Autumn Leaves & Fireside',
      caption_zh: '枫树和榉树的朱红。围着篝火的漫长夜晚，地酒与主厨手艺。', caption_ja: '楓と欅の朱。薪火を囲む長い夜、地酒と料理長の手仕事。', caption_en: 'The crimson of maple and zelkova. Long evenings around the fire with local sake and chef\'s craft.' },
    { season: 'winter', jp_label: '冬', en_label: 'Hibernal', display_order: 3,
      sub_zh: '赏雪与温泉', sub_ja: '雪見と源泉', sub_en: 'Snow Views & Natural Springs',
      caption_zh: '宁静的森林。露天浴池、雪景、蒸汽后面的浅间山。', caption_ja: '静まる森。露天と雪、湯気の向こうに浅間。', caption_en: 'Quiet forest. Open-air bath, snow, and Mt. Asama beyond the steam.' },
  ],
  villas: [
    { villa_key: 'kaede',  display_order: 0,
      name_zh: '枫 Kaede',   name_ja: '楓 Kaede',   name_en: 'Kaede (Maple)',
      spec_zh: '2卧室 · 4人 · 160㎡', spec_ja: '2ベッドルーム · 4名 · 160㎡', spec_en: '2BR · 4 guests · 160㎡',
      tag_zh: '最受欢迎', tag_ja: '最人気', tag_en: 'Most Popular',
      description_zh: '被枫树环绕的别墅，秋季红叶尽收眼底。', description_ja: '楓に囲まれた邸。秋の紅葉が眼前に広がる。', description_en: 'Surrounded by maple trees with autumn foliage views.' },
    { villa_key: 'kaba',   display_order: 1,
      name_zh: '桦 Kaba',    name_ja: '樺 Kaba',    name_en: 'Kaba (Birch)',
      spec_zh: '1卧室 · 2人 · 120㎡', spec_ja: '1ベッドルーム · 2名 · 120㎡', spec_en: '1BR · 2 guests · 120㎡',
      tag_zh: '情侣首选', tag_ja: 'カップル向き', tag_en: 'For Couples',
      description_zh: '白桦林中的宁静独栋，适合情侣私密滞在。', description_ja: '白樺林に佇む静謐な一棟。カップルに最適。', description_en: 'A serene villa in birch woods, ideal for couples.' },
    { villa_key: 'keyaki', display_order: 2,
      name_zh: '欅 Keyaki',  name_ja: '欅 Keyaki',  name_en: 'Keyaki (Zelkova)',
      spec_zh: '3卧室 · 6人 · 200㎡', spec_ja: '3ベッドルーム · 6名 · 200㎡', spec_en: '3BR · 6 guests · 200㎡',
      tag_zh: '家庭推荐', tag_ja: 'ファミリー向き', tag_en: 'Family Choice',
      description_zh: '宽敞的三卧室，大家庭聚会的理想选择。', description_ja: '開放的な3室で、大人数のご家族に最適。', description_en: 'Spacious three bedrooms, perfect for family gatherings.' },
    { villa_key: 'sakaki', display_order: 3,
      name_zh: '榊 Sakaki',  name_ja: '榊 Sakaki',  name_en: 'Sakaki (Sacred Tree)',
      spec_zh: '2卧室 · 4人 · 150㎡', spec_ja: '2ベッドルーム · 4名 · 150㎡', spec_en: '2BR · 4 guests · 150㎡',
      tag_zh: '最高级', tag_ja: 'プレミアム', tag_en: 'Premium',
      description_zh: '浅间山全景视野，最具奢华感的别墅。', description_ja: '浅間山を一望。最もラグジュアリーな邸。', description_en: 'Panoramic Asama views — the most luxurious villa.' },
  ],
  stay_plans: [
    { plan_key: 'weekend', step_number_text: '01', display_order: 0,
      tag_zh: '周末', tag_ja: '週末', tag_en: 'Weekend',
      title_zh: '森林周末', title_ja: '森の週末', title_en: 'Forest Weekend',
      description_zh: '两天一夜的放松假期。从东京出发，沉浸于自然中。', description_ja: '1泊2日のリトリート。東京を離れ、自然に溶け込む。', description_en: 'A 2-day retreat. Leave Tokyo and immerse yourself in nature.',
      price_text: '¥180,000〜' },
    { plan_key: 'anniversary', step_number_text: '02', display_order: 1,
      tag_zh: '纪念日', tag_ja: 'アニバーサリー', tag_en: 'Anniversary',
      title_zh: '特别纪念日', title_ja: '記念日プラン', title_en: 'Anniversary Plan',
      description_zh: '为特别的两人定制的豪华体验。专属管家与花卉装饰。', description_ja: '大切な二人のための特別プラン。専属バトラーと花飾り。', description_en: 'A bespoke experience for two. Dedicated butler and floral arrangements.',
      price_text: '¥380,000〜' },
    { plan_key: 'longstay', step_number_text: '03', display_order: 2,
      tag_zh: '长住', tag_ja: 'ロングステイ', tag_en: 'Long Stay',
      title_zh: '远程工作套餐', title_ja: 'ワーケーション', title_en: 'Workcation',
      description_zh: '三天以上，在宁静的森林别墅中工作与度假。', description_ja: '3泊以上。静寂の森で、仕事と休暇を両立する。', description_en: '3+ nights. Balance work and leisure in a tranquil forest villa.',
      price_text: '¥520,000〜' },
  ],
  location: {
    eyebrow_zh: '交通 · 地址', eyebrow_ja: 'アクセス · 所在地', eyebrow_en: 'Access · Location',
    title_zh: '从东京轻松抵达。', title_ja: '東京から、やすやすと。', title_en: 'Easy to reach from Tokyo.',
    description_zh: '乘坐北陆新干线约71分钟即可从东京抵达。我们提供从站台到别墅的接送服务。',
    description_ja: '北陸新幹線で東京から約71分。駅から別荘までの送迎もご用意しております。',
    description_en: 'About 71 minutes from Tokyo by Hokuriku Shinkansen. Transfer service from the station is available.',
    address_zh: '长野县北佐久郡轻井泽町', address_ja: '長野県北佐久郡軽井沢町', address_en: 'Karuizawa-machi, Kitasaku-gun, Nagano',
  },
  location_access: [
    { display_order: 0, origin_zh: '东京站', origin_ja: '東京駅', origin_en: 'Tokyo Station', duration_zh: '新干线71分钟', duration_ja: '新幹線で71分', duration_en: '71 min by Shinkansen' },
    { display_order: 1, origin_zh: '轻井泽站', origin_ja: '軽井沢駅', origin_en: 'Karuizawa Station', duration_zh: '专车约15分钟', duration_ja: '送迎車で約15分', duration_en: '15 min by transfer car' },
  ],
  cta: {
    eyebrow_zh: '最后的邀请', eyebrow_ja: 'Final Invitation', eyebrow_en: 'Final Invitation',
    title_line1_zh: '四栋中，', title_line1_ja: '四棟のうち、', title_line1_en: 'Of the four villas,',
    title_line2_zh: '今晚的那一栋。', title_line2_ja: '今夜の一棟を。', title_line2_en: 'tonight\'s one is yours.',
    subtitle_zh: '剩余房间有限。我们接受3个月以内的预约。',
    subtitle_ja: '残り室数はわずか。予約は3ヶ月先まで承ります。',
    subtitle_en: 'Limited availability. Reservations accepted up to 3 months in advance.',
    primary_label_zh: '立即预约', primary_label_ja: 'ご予約はこちら', primary_label_en: 'Reserve Now',
    secondary_label_zh: '咨询礼宾', secondary_label_ja: 'コンシェルジュに相談', secondary_label_en: 'Contact Concierge',
    secondary_url: '/contact',
  },
  home_sections: [
    { section_key: 'hero',     display_order: 1 },
    { section_key: 'flow',     display_order: 2 },
    { section_key: 'villas',   display_order: 3 },
    { section_key: 'seasons',  display_order: 4 },
    { section_key: 'plans',    display_order: 5 },
    { section_key: 'videos',   display_order: 6 },
    { section_key: 'location', display_order: 7 },
    { section_key: 'cta',      display_order: 8 },
  ],
  hero_slides: [
    { image_url: 'https://d143jkdkye8i79.cloudfront.net/uploads/uncategorized/1775322246609-hoshino_haru.jpeg', alt_ja: '星野リゾート春', display_order: 0 },
    { image_url: 'https://d143jkdkye8i79.cloudfront.net/uploads/uncategorized/1775322255657-hoshino_natu.jpg',  alt_ja: '星野リゾート夏', display_order: 1 },
    { image_url: 'https://d143jkdkye8i79.cloudfront.net/uploads/uncategorized/1775322227661-hosino_aki.jpeg',   alt_ja: '星野リゾート秋', display_order: 2 },
    { image_url: 'https://d143jkdkye8i79.cloudfront.net/uploads/uncategorized/1775322238229-hosino_fuyu.jpeg',  alt_ja: '星野リゾート冬', display_order: 3 },
  ],
  video_section: {
    eyebrow_zh: '影片展示', eyebrow_ja: '動画ギャラリー', eyebrow_en: 'Video Gallery',
    title_zh: 'Foresta Asama的世界。', title_ja: 'Foresta Asamaの世界。', title_en: 'The World of Foresta Asama.',
    subtitle_zh: '通过影片，感受轻井泽的四季与别墅生活。', subtitle_ja: '映像を通じて、軽井沢の四季とヴィラライフをご覧ください。', subtitle_en: 'Experience the seasons and villa life of Karuizawa through film.',
  },
  featured_videos: [
    {
      title_zh: 'Foresta Asama 紹介映像',
      title_ja: 'Foresta Asama 紹介映像',
      title_en: 'Foresta Asama Introduction',
      video_url: 'https://d143jkdkye8i79.cloudfront.net/uploads/videos/1774275846996-generated-video__1_.mp4',
      thumbnail_url: 'https://d143jkdkye8i79.cloudfront.net/uploads/uncategorized/1775322246609-hoshino_haru.jpeg',
      description_zh: '轻井泽浅间山麓的私人别墅。', description_ja: '軽井沢・浅間山麓のプライベートヴィラ。', description_en: 'Private villas at the foot of Mt. Asama, Karuizawa.',
      display_order: 0,
    },
  ],
};

export async function ensureV3Tables(isTest = false): Promise<void> {
  const db = getDb(isTest);
  for (const ddl of V3_DDL) {
    await db.query(ddl);
  }
  // Seed site_settings if empty
  const [ssRows] = await db.query('SELECT COUNT(*) AS cnt FROM site_settings') as any[][];
  if (ssRows[0].cnt === 0) {
    for (const r of V3_SEEDS.site_settings) {
      await db.query(
        'INSERT IGNORE INTO site_settings (setting_key, value_raw, value_zh, value_ja, value_en) VALUES (?,?,?,?,?)',
        [r.setting_key, r.value_raw ?? null, r.value_zh ?? null, r.value_ja ?? null, r.value_en ?? null],
      );
    }
  }
  // Seed hero_section if empty
  const [hsRows] = await db.query('SELECT COUNT(*) AS cnt FROM hero_section') as any[][];
  if (hsRows[0].cnt === 0) {
    const h = V3_SEEDS.hero_section;
    await db.query(
      `INSERT INTO hero_section (id, eyebrow_zh, eyebrow_ja, eyebrow_en, title_line1_zh, title_line1_ja, title_line1_en,
        title_line2_zh, title_line2_ja, title_line2_en, subtitle_zh, subtitle_ja, subtitle_en)
       VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [h.eyebrow_zh, h.eyebrow_ja, h.eyebrow_en, h.title_line1_zh, h.title_line1_ja, h.title_line1_en,
       h.title_line2_zh, h.title_line2_ja, h.title_line2_en, h.subtitle_zh, h.subtitle_ja, h.subtitle_en],
    );
  }
  // Seed hero_stats
  const [hstRows] = await db.query('SELECT COUNT(*) AS cnt FROM hero_stats') as any[][];
  if (hstRows[0].cnt === 0) {
    for (const s of V3_SEEDS.hero_stats) {
      await db.query(
        'INSERT INTO hero_stats (value_text, label_zh, label_ja, label_en, display_order) VALUES (?,?,?,?,?)',
        [s.value_text, s.label_zh, s.label_ja, s.label_en, s.display_order],
      );
    }
  }
  // Seed flow_section
  const [fsRows] = await db.query('SELECT COUNT(*) AS cnt FROM flow_section') as any[][];
  if (fsRows[0].cnt === 0) {
    const f = V3_SEEDS.flow_section;
    await db.query(
      'INSERT INTO flow_section (id, eyebrow_zh, eyebrow_ja, eyebrow_en, title_zh, title_ja, title_en, subtitle_zh, subtitle_ja, subtitle_en) VALUES (1,?,?,?,?,?,?,?,?,?)',
      [f.eyebrow_zh, f.eyebrow_ja, f.eyebrow_en, f.title_zh, f.title_ja, f.title_en, f.subtitle_zh, f.subtitle_ja, f.subtitle_en],
    );
    for (const step of V3_SEEDS.flow_steps) {
      await db.query(
        `INSERT INTO flow_steps (step_number, step_label_zh, step_label_ja, step_label_en, title_zh, title_ja, title_en,
          description_zh, description_ja, description_en, cta_label_zh, cta_label_ja, cta_label_en, cta_url, is_external, display_order)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [step.step_number, step.step_label_zh, step.step_label_ja, step.step_label_en,
         step.title_zh, step.title_ja, step.title_en,
         step.description_zh, step.description_ja, step.description_en,
         step.cta_label_zh, step.cta_label_ja, step.cta_label_en,
         step.cta_url, step.is_external, step.display_order],
      );
    }
  }
  // Seed seasons_meta
  const [smRows] = await db.query('SELECT COUNT(*) AS cnt FROM seasons_meta') as any[][];
  if (smRows[0].cnt === 0) {
    for (const s of V3_SEEDS.seasons_meta) {
      await db.query(
        `INSERT INTO seasons_meta (season, jp_label, en_label, sub_zh, sub_ja, sub_en, caption_zh, caption_ja, caption_en, display_order)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [s.season, s.jp_label, s.en_label, s.sub_zh, s.sub_ja, s.sub_en, s.caption_zh, s.caption_ja, s.caption_en, s.display_order],
      );
    }
  }
  // Seed villas
  const [vlRows] = await db.query('SELECT COUNT(*) AS cnt FROM villas') as any[][];
  if (vlRows[0].cnt === 0) {
    for (const v of V3_SEEDS.villas) {
      await db.query(
        `INSERT INTO villas (villa_key, name_zh, name_ja, name_en, spec_zh, spec_ja, spec_en, tag_zh, tag_ja, tag_en, description_zh, description_ja, description_en, display_order)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [v.villa_key, v.name_zh, v.name_ja, v.name_en, v.spec_zh, v.spec_ja, v.spec_en,
         v.tag_zh, v.tag_ja, v.tag_en, v.description_zh, v.description_ja, v.description_en, v.display_order],
      );
    }
  }
  // Seed stay_plans
  const [spRows] = await db.query('SELECT COUNT(*) AS cnt FROM stay_plans') as any[][];
  if (spRows[0].cnt === 0) {
    for (const p of V3_SEEDS.stay_plans) {
      await db.query(
        `INSERT INTO stay_plans (plan_key, tag_zh, tag_ja, tag_en, step_number_text, title_zh, title_ja, title_en,
          description_zh, description_ja, description_en, price_text, display_order)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [p.plan_key, p.tag_zh, p.tag_ja, p.tag_en, p.step_number_text,
         p.title_zh, p.title_ja, p.title_en,
         p.description_zh, p.description_ja, p.description_en, p.price_text, p.display_order],
      );
    }
  }
  // Seed location_section
  const [lsRows] = await db.query('SELECT COUNT(*) AS cnt FROM location_section') as any[][];
  if (lsRows[0].cnt === 0) {
    const l = V3_SEEDS.location;
    await db.query(
      `INSERT INTO location_section (id, eyebrow_zh, eyebrow_ja, eyebrow_en, title_zh, title_ja, title_en,
        description_zh, description_ja, description_en, address_zh, address_ja, address_en)
       VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [l.eyebrow_zh, l.eyebrow_ja, l.eyebrow_en, l.title_zh, l.title_ja, l.title_en,
       l.description_zh, l.description_ja, l.description_en, l.address_zh, l.address_ja, l.address_en],
    );
    for (const a of V3_SEEDS.location_access) {
      await db.query(
        'INSERT INTO location_access (display_order, origin_zh, origin_ja, origin_en, duration_zh, duration_ja, duration_en) VALUES (?,?,?,?,?,?,?)',
        [a.display_order, a.origin_zh, a.origin_ja, a.origin_en, a.duration_zh, a.duration_ja, a.duration_en],
      );
    }
  }
  // Seed cta_section
  const [ctaRows] = await db.query('SELECT COUNT(*) AS cnt FROM cta_section') as any[][];
  if (ctaRows[0].cnt === 0) {
    const c = V3_SEEDS.cta;
    await db.query(
      `INSERT INTO cta_section (id, eyebrow_zh, eyebrow_ja, eyebrow_en,
        title_line1_zh, title_line1_ja, title_line1_en,
        title_line2_zh, title_line2_ja, title_line2_en,
        subtitle_zh, subtitle_ja, subtitle_en,
        primary_label_zh, primary_label_ja, primary_label_en,
        secondary_label_zh, secondary_label_ja, secondary_label_en, secondary_url)
       VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [c.eyebrow_zh, c.eyebrow_ja, c.eyebrow_en,
       c.title_line1_zh, c.title_line1_ja, c.title_line1_en,
       c.title_line2_zh, c.title_line2_ja, c.title_line2_en,
       c.subtitle_zh, c.subtitle_ja, c.subtitle_en,
       c.primary_label_zh, c.primary_label_ja, c.primary_label_en,
       c.secondary_label_zh, c.secondary_label_ja, c.secondary_label_en, c.secondary_url],
    );
  }
  // Seed home_sections
  const [hscRows] = await db.query('SELECT COUNT(*) AS cnt FROM home_sections') as any[][];
  if (hscRows[0].cnt === 0) {
    for (const s of V3_SEEDS.home_sections) {
      await db.query('INSERT INTO home_sections (section_key, display_order, is_enabled) VALUES (?,?,1)', [s.section_key, s.display_order]);
    }
  }

  // Seed hero_slides
  const [hslidRows] = await db.query('SELECT COUNT(*) AS cnt FROM hero_slides') as any[][];
  if (hslidRows[0].cnt === 0) {
    for (const s of V3_SEEDS.hero_slides) {
      await db.query(
        'INSERT INTO hero_slides (image_url, alt_zh, alt_ja, alt_en, display_order) VALUES (?,?,?,?,?)',
        [s.image_url, '', s.alt_ja, s.alt_ja, s.display_order],
      );
    }
  }
  // Seed video_section
  const [vsRows] = await db.query('SELECT COUNT(*) AS cnt FROM video_section') as any[][];
  if (vsRows[0].cnt === 0) {
    const v = V3_SEEDS.video_section;
    await db.query(
      `INSERT INTO video_section (id, eyebrow_zh, eyebrow_ja, eyebrow_en, title_zh, title_ja, title_en, subtitle_zh, subtitle_ja, subtitle_en)
       VALUES (1,?,?,?,?,?,?,?,?,?)`,
      [v.eyebrow_zh, v.eyebrow_ja, v.eyebrow_en, v.title_zh, v.title_ja, v.title_en, v.subtitle_zh, v.subtitle_ja, v.subtitle_en],
    );
  }
  // Seed featured_videos
  const [fvRows] = await db.query('SELECT COUNT(*) AS cnt FROM featured_videos') as any[][];
  if (fvRows[0].cnt === 0) {
    for (const v of V3_SEEDS.featured_videos) {
      await db.query(
        `INSERT INTO featured_videos (title_zh, title_ja, title_en, video_url, thumbnail_url, description_zh, description_ja, description_en, display_order)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [v.title_zh, v.title_ja, v.title_en, v.video_url, v.thumbnail_url, v.description_zh, v.description_ja, v.description_en, v.display_order],
      );
    }
  }
  // Ensure videos entry in home_sections
  await db.query(
    `INSERT IGNORE INTO home_sections (section_key, display_order, is_enabled) VALUES ('videos', 6, 1)`,
  );

  // ─── Image URL registration (idempotent: only updates when empty) ──────────
  const CDN = 'https://d143jkdkye8i79.cloudfront.net/uploads/uncategorized';
  const IMG = {
    hero:     `${CDN}/1775322246609-hoshino_haru.jpeg`,   // 637KB 星野リゾート春
    spring:   `${CDN}/1775230988817-haru.jpg`,             // 516KB 春の景色
    summer:   `${CDN}/1775230988912-natu.jpeg`,            // 192KB 夏の景色
    autumn:   `${CDN}/1775230909440-aki.jpg`,              // 101KB 秋の景色
    winter:   `${CDN}/1775230988732-fuyo.jpg`,             // 281KB 冬の景色
    kaede:    `${CDN}/1773137351550-615329172.jpg`,         // 206KB ヴィラ1
    kaba:     `${CDN}/1773137351503-615329166.jpg`,         // 143KB ヴィラ2
    keyaki:   `${CDN}/1773137351457-615329163.jpg`,         // 158KB ヴィラ3
    sakaki:   `${CDN}/1773137351411-615329162.jpg`,         // 120KB ヴィラ4
    weekend:  `${CDN}/1773137350276-615328774.jpg`,         // 169KB プラン1
    anniv:    `${CDN}/1775322228688-wine.jpg`,              // 2.4MB ワイン高級ダイニング
    workcation:`${CDN}/1773137375706-615808801.jpg`,        // 238KB プラン3
  };

  await db.query(`UPDATE hero_section SET background_image_url=? WHERE id=1 AND (background_image_url IS NULL OR background_image_url='')`, [IMG.hero]);
  for (const [season, url] of [['spring',IMG.spring],['summer',IMG.summer],['autumn',IMG.autumn],['winter',IMG.winter]] as [string,string][]) {
    await db.query(`UPDATE seasons_meta SET main_image_url=? WHERE season=? AND (main_image_url IS NULL OR main_image_url='')`, [url, season]);
  }
  for (const [key, url] of [['kaede',IMG.kaede],['kaba',IMG.kaba],['keyaki',IMG.keyaki],['sakaki',IMG.sakaki]] as [string,string][]) {
    await db.query(`UPDATE villas SET main_image_url=? WHERE villa_key=? AND (main_image_url IS NULL OR main_image_url='')`, [url, key]);
  }
  for (const [key, url] of [['weekend',IMG.weekend],['anniversary',IMG.anniv],['longstay',IMG.workcation]] as [string,string][]) {
    await db.query(`UPDATE stay_plans SET main_image_url=? WHERE plan_key=? AND (main_image_url IS NULL OR main_image_url='')`, [url, key]);
  }

  // ─── Ensure admin user exists ─────────────────────────────────────────────
  // SHA-256 of 'wangjing0831'
  const ADMIN_HASH = '8d7863e0a63c74d8a7e0fa603e02d25efc87dee70fbca6c460e07a2bb37b8bb3';
  await db.query(
    `INSERT INTO users (username, password_hash, role) VALUES ('admin',?,'admin')
     ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)`,
    [ADMIN_HASH],
  ).catch(() => {}); // ignore if users table doesn't exist yet
}
