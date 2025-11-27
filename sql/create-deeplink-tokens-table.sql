-- 🔐 One-Time Deeplink Tokens Table
-- Stores single-use tokens for deeplinks to prevent replay attacks

CREATE TABLE IF NOT EXISTS deeplink_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id uuid REFERENCES brands(id) ON DELETE CASCADE,
  page_id uuid REFERENCES pages(id) ON DELETE SET NULL,
  
  -- Token metadata
  token_type text NOT NULL DEFAULT 'page_edit', -- 'page_edit', 'brand_settings', 'quick_start'
  expires_at timestamptz NOT NULL,
  
  -- Usage tracking
  used boolean DEFAULT false,
  used_at timestamptz,
  used_from_ip inet,
  used_user_agent text,
  
  -- Security metadata
  browser_fingerprint text,
  created_from_ip inet,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_deeplink_tokens_token ON deeplink_tokens(token) WHERE used = false;
CREATE INDEX idx_deeplink_tokens_expires ON deeplink_tokens(expires_at) WHERE used = false;
CREATE INDEX idx_deeplink_tokens_user ON deeplink_tokens(user_id);
CREATE INDEX idx_deeplink_tokens_brand ON deeplink_tokens(brand_id);

-- Row Level Security
ALTER TABLE deeplink_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only see their own tokens
CREATE POLICY "Users can view own deeplink tokens"
  ON deeplink_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert tokens (via authenticated API)
CREATE POLICY "Users can create deeplink tokens"
  ON deeplink_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own unused tokens
CREATE POLICY "Users can update own unused tokens"
  ON deeplink_tokens
  FOR UPDATE
  USING (auth.uid() = user_id AND used = false);

-- Cleanup function: Delete expired tokens (run daily via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_deeplink_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM deeplink_tokens
  WHERE expires_at < now() - interval '24 hours';
  
  RAISE NOTICE 'Cleaned up expired deeplink tokens';
END;
$$;

-- Optional: Auto-cleanup trigger
CREATE OR REPLACE FUNCTION auto_cleanup_on_access()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- When checking token, also cleanup old ones (throttled)
  IF random() < 0.01 THEN -- 1% of the time
    DELETE FROM deeplink_tokens
    WHERE expires_at < now() - interval '24 hours'
    LIMIT 100;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_cleanup_deeplink_tokens
  AFTER SELECT ON deeplink_tokens
  FOR EACH STATEMENT
  EXECUTE FUNCTION auto_cleanup_on_access();

-- Comments
COMMENT ON TABLE deeplink_tokens IS 'One-time use tokens for secure deeplinks to prevent replay attacks';
COMMENT ON COLUMN deeplink_tokens.token IS 'Unique cryptographically secure token';
COMMENT ON COLUMN deeplink_tokens.token_type IS 'Type of deeplink: page_edit, brand_settings, quick_start';
COMMENT ON COLUMN deeplink_tokens.browser_fingerprint IS 'Browser fingerprint to bind token to device';
