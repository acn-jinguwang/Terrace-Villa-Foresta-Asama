-- ============================================================
-- Terrace Villa Foresta Asama — Database DDL
-- Database: foresta_asama
-- Created: 2026-03-11
-- ============================================================

CREATE DATABASE IF NOT EXISTS foresta_asama
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE foresta_asama;

-- ------------------------------------------------------------
-- 1. media — 画像・動画メディアファイル管理
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media (
  id           VARCHAR(128)  NOT NULL COMMENT 'ファイル識別ID（タイムスタンプ+ランダム）',
  name         VARCHAR(255)  NOT NULL COMMENT '表示名 / alt テキスト',
  url          VARCHAR(1000) NOT NULL COMMENT 'アクセス用URLパス（S3 or /uploads/...）',
  type         ENUM('image','video') NOT NULL DEFAULT 'image' COMMENT 'メディア種別',
  category     VARCHAR(100)  NOT NULL DEFAULT 'uncategorized' COMMENT 'カテゴリ（未分類/hotel/surroundings等）',
  size         VARCHAR(50)   DEFAULT NULL COMMENT 'ファイルサイズ表示用（例: 2.3 MB）',
  upload_date  DATE          DEFAULT NULL COMMENT 'アップロード日',
  is_hero      TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'ヒーロー初期表示フラグ（legacy）',
  s3_key       VARCHAR(1000) DEFAULT NULL COMMENT 'S3オブジェクトキー（本番用）',
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_type     (type),
  INDEX idx_category (category),
  INDEX idx_upload_date (upload_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='画像・動画メディアファイル管理';

-- ------------------------------------------------------------
-- 2. page_layouts — ページレイアウト（セクション→画像URL配列）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS page_layouts (
  section_key  VARCHAR(100)  NOT NULL COMMENT 'セクション識別子（例: home.hero, plan.golf.gallery）',
  image_urls   JSON          NOT NULL COMMENT '順序付き画像URLの配列',
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (section_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='ページ別セクションの画像配置情報';

-- デフォルトセクションの初期データ
INSERT IGNORE INTO page_layouts (section_key, image_urls) VALUES
  ('home.hero',            '[]'),
  ('home.hotel',           '[]'),
  ('home.surroundings',    '[]'),
  ('gallery.hotel',        '[]'),
  ('gallery.surroundings', '[]'),
  ('surroundings.spots',   '[]');

-- ------------------------------------------------------------
-- 3. plans — 旅行プラン
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plans (
  id              VARCHAR(100)  NOT NULL COMMENT 'プランID（URLスラグ, 例: golf）',
  title_zh        VARCHAR(255)  NOT NULL DEFAULT '' COMMENT '中国語タイトル',
  title_ja        VARCHAR(255)  NOT NULL DEFAULT '' COMMENT '日本語タイトル',
  title_en        VARCHAR(255)  NOT NULL DEFAULT '' COMMENT '英語タイトル',
  desc_zh         TEXT          COMMENT '中国語説明文',
  desc_ja         TEXT          COMMENT '日本語説明文',
  desc_en         TEXT          COMMENT '英語説明文',
  duration        INT           NOT NULL DEFAULT 3 COMMENT '宿泊日数',
  price           VARCHAR(50)   NOT NULL DEFAULT '' COMMENT '料金表示（例: ¥30,000）',
  tag_zh          VARCHAR(100)  DEFAULT '' COMMENT '中国語バッジタグ',
  tag_ja          VARCHAR(100)  DEFAULT '' COMMENT '日本語バッジタグ',
  tag_en          VARCHAR(100)  DEFAULT '' COMMENT '英語バッジタグ',
  highlights_zh   JSON          COMMENT '中国語ハイライト一覧（配列）',
  highlights_ja   JSON          COMMENT '日本語ハイライト一覧（配列）',
  highlights_en   JSON          COMMENT '英語ハイライト一覧（配列）',
  cover_image     VARCHAR(1000) DEFAULT '' COMMENT 'カバー画像URL',
  visible         TINYINT(1)    NOT NULL DEFAULT 1 COMMENT '公開フラグ（1=公開, 0=非公開）',
  sort_order      INT           NOT NULL DEFAULT 0 COMMENT '表示順',
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_visible    (visible),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='旅行プラン情報';

-- ------------------------------------------------------------
-- 4. users — 管理者ユーザー認証
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(100)  NOT NULL COMMENT 'ユーザーID',
  username      VARCHAR(100)  NOT NULL COMMENT 'ログイン名',
  password_hash VARCHAR(255)  NOT NULL COMMENT 'パスワードハッシュ（SHA-256 hex）',
  role          ENUM('admin','viewer') NOT NULL DEFAULT 'admin',
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='管理者ユーザー';

-- ------------------------------------------------------------
-- 5. sessions — セッション管理（オプション: 現在はCookie使用）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  token       VARCHAR(128)  NOT NULL COMMENT 'セッショントークン',
  user_id     VARCHAR(100)  NOT NULL COMMENT 'users.id 参照',
  expires_at  TIMESTAMP     NOT NULL COMMENT '有効期限',
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (token),
  INDEX idx_user_id    (user_id),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='セッション管理';
