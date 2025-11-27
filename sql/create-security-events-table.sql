-- 🔐 Security Events Logging Table
-- Tracks all security-related events for monitoring and auditing

CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event classification
  event_type text NOT NULL, -- 'validation_success', 'validation_failed', 'token_expired', 'fingerprint_mismatch', 'session_invalid', 'rate_limit_exceeded'
  severity text NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'critical'
  
  -- User & session info
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  session_id text,
  
  -- Request metadata
  ip_address inet,
  user_agent text,
  referer text,
  
  -- Security details
  token_id uuid REFERENCES deeplink_tokens(id) ON DELETE SET NULL,
  browser_fingerprint text,
  
  -- Event details
  message text,
  metadata jsonb, -- Flexible storage for additional context
  
  -- Geolocation (optional)
  country_code char(2),
  city text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now()
);

-- Indexes for fast querying and monitoring
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_user ON security_events(user_id);
CREATE INDEX idx_security_events_brand ON security_events(brand_id);
CREATE INDEX idx_security_events_created ON security_events(created_at DESC);
CREATE INDEX idx_security_events_ip ON security_events(ip_address);

-- Composite index for monitoring suspicious activity
CREATE INDEX idx_security_events_suspicious ON security_events(ip_address, event_type, created_at)
  WHERE severity IN ('error', 'critical');

-- Row Level Security
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Admins can view all events
CREATE POLICY "Admins can view all security events"
  ON security_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );

-- Users can view their own events
CREATE POLICY "Users can view own security events"
  ON security_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert events
CREATE POLICY "Service role can insert security events"
  ON security_events
  FOR INSERT
  WITH CHECK (true);

-- Helper function: Log security event
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type text,
  p_severity text DEFAULT 'info',
  p_user_id uuid DEFAULT NULL,
  p_brand_id uuid DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_message text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id uuid;
BEGIN
  INSERT INTO security_events (
    event_type,
    severity,
    user_id,
    brand_id,
    ip_address,
    user_agent,
    message,
    metadata
  ) VALUES (
    p_event_type,
    p_severity,
    p_user_id,
    p_brand_id,
    p_ip_address,
    p_user_agent,
    p_message,
    p_metadata
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- Helper function: Get recent failed validations for IP
CREATE OR REPLACE FUNCTION get_failed_validations_count(
  p_ip_address inet,
  p_minutes int DEFAULT 5
)
RETURNS int
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::int
  FROM security_events
  WHERE ip_address = p_ip_address
    AND event_type IN ('validation_failed', 'token_expired', 'fingerprint_mismatch')
    AND created_at > now() - (p_minutes || ' minutes')::interval;
$$;

-- Helper function: Check for suspicious activity
CREATE OR REPLACE FUNCTION detect_suspicious_activity(
  p_ip_address inet,
  p_threshold int DEFAULT 10,
  p_minutes int DEFAULT 5
)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM security_events
    WHERE ip_address = p_ip_address
      AND severity IN ('error', 'critical')
      AND created_at > now() - (p_minutes || ' minutes')::interval
    GROUP BY ip_address
    HAVING COUNT(*) >= p_threshold
  );
$$;

-- Auto-cleanup old events (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_security_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM security_events
  WHERE created_at < now() - interval '90 days';
  
  RAISE NOTICE 'Cleaned up old security events';
END;
$$;

-- Create materialized view for monitoring dashboard
CREATE MATERIALIZED VIEW security_events_summary AS
SELECT
  date_trunc('hour', created_at) as hour,
  event_type,
  severity,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT ip_address) as unique_ips
FROM security_events
WHERE created_at > now() - interval '7 days'
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 4 DESC;

CREATE INDEX ON security_events_summary(hour DESC);

-- Refresh materialized view (run via cron every hour)
CREATE OR REPLACE FUNCTION refresh_security_events_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY security_events_summary;
  RAISE NOTICE 'Refreshed security events summary';
END;
$$;

-- Comments
COMMENT ON TABLE security_events IS 'Audit log for all security-related events';
COMMENT ON FUNCTION log_security_event IS 'Helper function to log security events from application code';
COMMENT ON FUNCTION get_failed_validations_count IS 'Count recent failed validation attempts from IP';
COMMENT ON FUNCTION detect_suspicious_activity IS 'Check if IP shows suspicious behavior pattern';
COMMENT ON MATERIALIZED VIEW security_events_summary IS 'Hourly summary of security events for monitoring dashboard';
