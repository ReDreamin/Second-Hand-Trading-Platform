CREATE TABLE user_accounts (
  id BIGSERIAL PRIMARY KEY,

  username VARCHAR(64) UNIQUE,
  email VARCHAR(128) UNIQUE,
  phone VARCHAR(32) UNIQUE,

  password_hash TEXT NOT NULL,      -- 永远不存明文
  password_algo VARCHAR(32),         -- bcrypt / argon2

  status SMALLINT NOT NULL DEFAULT 1,
  -- 1: normal, 0: disabled, -1: deleted

  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE user_profiles (
  user_id BIGINT PRIMARY KEY REFERENCES user_accounts(id),

  nickname VARCHAR(64),
  avatar_url TEXT,
  gender SMALLINT,
  birthday DATE,
  bio TEXT,

  updated_at TIMESTAMP DEFAULT now()
);
