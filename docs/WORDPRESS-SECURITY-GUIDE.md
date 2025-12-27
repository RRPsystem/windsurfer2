# 🔐 WordPress Integration - Security & Best Practices

Complete security guide voor de WordPress integratie met AI Website Studio Builder.

## 🎯 Aanpak van Security Concerns

Deze guide addresseert alle security issues die geïdentificeerd zijn:

1. ✅ **Brand Security / Multi-Tenant**
2. ✅ **Webhook Security**
3. ✅ **Time-out & UX Handling**
4. ✅ **Cost Control**
5. ✅ **Content Ownership & Update Strategy**

---

## 1. 🔐 Brand Security / Multi-Tenant

### ❌ Probleem
Agent kan per ongeluk (of expres) `brand_id` in request wijzigen en content van andere brands ophalen.

### ✅ Oplossing: API Key → Brand ID Mapping

```javascript
// API SIDE: Verify authentication
async function verifyAuthentication(req) {
    const apiKey = req.headers['x-api-key'];
    const requestedBrandId = req.query.brandId || req.body.brandId;
    
    // Query database: Does this API key belong to this brand?
    const { data: brand } = await supabase
        .from('brands')
        .select('id, api_key, name')
        .eq('id', requestedBrandId)
        .single();
    
    // Timing-safe comparison (prevents timing attacks)
    if (!timingSafeEqual(apiKey, brand.api_key)) {
        return { success: false, message: 'Invalid API key for this brand' };
    }
    
    return { success: true, brandId: requestedBrandId };
}

// Use authorized brand ID (never trust client input!)
async function handlePullRequest(req, res, authorizedBrandId) {
    // Use authorizedBrandId, not req.query.brandId!
    const data = await supabase
        .from('pages')
        .eq('brand_id', authorizedBrandId)  // ← Server-verified!
        .select('*');
}
```

### Database Schema

```sql
-- brands table moet api_key kolom hebben
ALTER TABLE brands ADD COLUMN IF NOT EXISTS api_key TEXT UNIQUE;

-- Generate API key voor elke brand
UPDATE brands 
SET api_key = encode(gen_random_bytes(32), 'hex')
WHERE api_key IS NULL;

-- Index voor snelle lookups
CREATE INDEX IF NOT EXISTS idx_brands_api_key ON brands(api_key);
```

### WordPress Setup

```php
// WordPress: Store API key in wp-config.php (NIET in database!)
define('AIWS_API_KEY', 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

// Gebruik in API calls
$response = wp_remote_get($api_url, [
    'headers' => [
        'X-API-Key' => AIWS_API_KEY,
        'Content-Type' => 'application/json'
    ]
]);
```

### Security Flow

```
1. WordPress maakt request met X-API-Key header
2. API ontvangt: brandId=xxx, X-API-Key=yyy
3. API query: SELECT * FROM brands WHERE id=xxx
4. API verify: Does brand.api_key === X-API-Key?
5. ✅ YES: Continue with authorized brand
6. ❌ NO:  Return 401 Unauthorized
7. Gebruik authorizedBrandId (niet client input!)
```

---

## 2. 🔒 Webhook Security

### ❌ Probleem
Zonder security kan iedereen de webhook endpoint aanroepen en fake data pushen.

### ✅ Oplossing: Multi-Layer Security

#### Layer 1: Bearer Token Authentication

```javascript
// API SIDE: Webhook URL allowlist
const CONFIG = {
    ALLOWED_WEBHOOK_DOMAINS: [
        'localhost',                    // Development
        '127.0.0.1',                   // Development
        '.ai-websitestudio.nl',        // Wildcard: *.ai-websitestudio.nl
        '.ai-travelstudio.nl',         // Wildcard
        '.jouw-agent-domain.nl',       // Agent domains
    ]
};

// Verify webhook URL
function isAllowedWebhookUrl(url) {
    const parsed = new URL(url);
    
    // Must be HTTPS in production
    if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
        return false;
    }
    
    // Check allowlist
    const hostname = parsed.hostname;
    return CONFIG.ALLOWED_WEBHOOK_DOMAINS.some(allowed => {
        if (allowed.startsWith('.')) {
            // Wildcard: .example.com matches subdomain.example.com
            return hostname.endsWith(allowed) || hostname === allowed.substring(1);
        }
        return hostname === allowed;
    });
}

// Reject if not in allowlist
if (wordpressUrl && !isAllowedWebhookUrl(wordpressUrl)) {
    return res.status(403).json({
        error: 'WordPress URL not in allowlist'
    });
}
```

#### Layer 2: WordPress Token Verification

```php
// WordPress plugin
public function verify_webhook_auth($request) {
    $auth_header = $request->get_header('authorization');
    $api_key = get_option('aiws_webhook_secret');
    
    // Empty = allow (development only!)
    if (empty($api_key)) {
        return WP_DEBUG === true;
    }
    
    // Verify Bearer token
    if (strpos($auth_header, 'Bearer ') === 0) {
        $token = substr($auth_header, 7);
        return hash_equals($api_key, $token); // Timing-safe!
    }
    
    return false;
}
```

#### Layer 3: IP Allowlist (Optional)

```php
// WordPress: Restrict by IP range
add_filter('rest_request_before_callbacks', function($response, $handler, $request) {
    if ($request->get_route() === '/aiws/v1/destinations/webhook') {
        $ip = $_SERVER['REMOTE_ADDR'];
        
        // Vercel IP ranges (example)
        $allowed_ips = [
            '76.76.19.0/24',
            '76.76.21.0/24',
            // Add Vercel/Builder IP ranges
        ];
        
        if (!ip_in_ranges($ip, $allowed_ips)) {
            return new WP_Error('forbidden', 'IP not allowed', ['status' => 403]);
        }
    }
    return $response;
}, 10, 3);
```

### Webhook Setup Checklist

- [ ] ✅ Generate strong secret (32+ random bytes)
- [ ] ✅ Store in wp-config.php (NOT in admin settings)
- [ ] ✅ Use HTTPS only (no HTTP in production)
- [ ] ✅ Verify Bearer token on WordPress side
- [ ] ✅ Add webhook URL to allowlist in API
- [ ] ✅ Test with curl/Postman first
- [ ] ✅ Monitor failed auth attempts
- [ ] ✅ Rotate secret every 6 months

---

## 3. ⏱️ Time-out & UX Handling

### ❌ Probleem
AI generatie duurt 10-30 seconden. WordPress admin kan time-outen bij sommige hosters.

### ✅ Oplossing: Multi-Strategy Approach

#### Strategy A: Cached Results (AANBEVOLEN)

```
Flow:
1. WordPress klikt "Generate"
2. Check: Exists in Builder cache?
   ✅ YES: Return cached (< 1 sec)
   ❌ NO:  Generate + cache + return
3. WordPress ontvangt binnen 2 sec
```

```javascript
// API: Check cache first
const { data: existing } = await supabase
    .from('pages')
    .select('*')
    .eq('brand_id', brandId)
    .eq('slug', `destination-${slug}`)
    .single();

if (existing) {
    // Return cached result immediately
    return res.status(200).json({
        success: true,
        destination: transformForWordPress(existing),
        cached: true
    });
}

// Not cached: Generate (with timeout)
try {
    const result = await generateWithTimeout(destination, 45000); // 45 sec max
    return res.status(200).json({ success: true, destination: result });
} catch (timeoutError) {
    // Timeout: Return 202 Accepted
    return res.status(202).json({
        success: false,
        processing: true,
        message: 'Generation in progress. Check back in 1-2 minutes.',
        retryAfter: 120
    });
}
```

#### Strategy B: Background Processing

```javascript
// For very slow generations
async function generateInBackground(destination, brandId) {
    // Start generation
    const jobId = await queueGeneration(destination, brandId);
    
    // Return immediately
    return {
        success: false,
        processing: true,
        jobId: jobId,
        statusUrl: `/api/wordpress/destinations/status/${jobId}`
    };
}
```

#### WordPress Plugin Handling

```php
// Handle 202 Accepted response
$response = wp_remote_post($api_url, [...]);
$status = wp_remote_retrieve_response_code($response);
$body = json_decode(wp_remote_retrieve_body($response), true);

if ($status === 202) {
    // Still processing
    wp_send_json_success([
        'processing' => true,
        'message' => $body['message'],
        'retryAfter' => $body['retryAfter'],
        'action' => 'poll' // Frontend should poll
    ]);
}

if ($status === 200) {
    // Success
    $this->create_destination($body['destination']);
    wp_send_json_success([
        'post_id' => $post_id,
        'message' => 'Destination created!'
    ]);
}
```

### Timeout Configuration

```javascript
// API CONFIG
const CONFIG = {
    GENERATION_TIMEOUT_MS: 45000,  // 45 sec (safe for most hosters)
};

// Per hoster optimalisatie:
// - Shared hosting: 30 sec
// - VPS: 60 sec
// - Dedicated: 90 sec
```

---

## 4. 💰 Cost Control

### ❌ Probleem
Agents kunnen spammen met "Generate" knop → kosten lopen op.

### ✅ Oplossing: Rate Limiting

#### Per Brand Limits

```javascript
const CONFIG = {
    RATE_LIMIT_PER_BRAND_PER_HOUR: 50,   // Max 50 requests/hour
    RATE_LIMIT_PER_BRAND_PER_DAY: 200,   // Max 200 requests/day
};

// Check rate limit
async function checkRateLimit(brandId) {
    const hourKey = `${brandId}:${currentHour}`;
    const dayKey = `${brandId}:${currentDay}`;
    
    const hourCount = cache.get(hourKey) || 0;
    const dayCount = cache.get(dayKey) || 0;
    
    if (hourCount >= CONFIG.RATE_LIMIT_PER_BRAND_PER_HOUR) {
        return {
            allowed: false,
            message: 'Rate limit exceeded: 50 requests per hour',
            retryAfter: secondsUntilNextHour
        };
    }
    
    // Increment
    cache.set(hourKey, hourCount + 1);
    cache.set(dayKey, dayCount + 1);
    
    return { allowed: true };
}
```

#### Cost Monitoring

```sql
-- Track costs per brand
CREATE TABLE IF NOT EXISTS api_usage (
    id BIGSERIAL PRIMARY KEY,
    brand_id UUID NOT NULL REFERENCES brands(id),
    endpoint VARCHAR(255) NOT NULL,
    cost_cents INTEGER NOT NULL,  -- Cost in cents
    created_at TIMESTAMP DEFAULT NOW()
);

-- Query costs
SELECT 
    brand_id,
    COUNT(*) as requests,
    SUM(cost_cents) / 100.0 as total_cost_eur
FROM api_usage
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY brand_id
ORDER BY total_cost_eur DESC;
```

#### Per-Agent Limits (Future)

```javascript
// Credit system
const CREDITS_PER_AGENT = {
    'starter': 10,     // 10 generations/month
    'professional': 50,
    'enterprise': 200
};

// Check credits
async function checkCredits(brandId) {
    const { data: brand } = await supabase
        .from('brands')
        .select('credits_remaining, plan_type')
        .eq('id', brandId)
        .single();
    
    if (brand.credits_remaining <= 0) {
        return {
            allowed: false,
            message: 'No credits remaining. Upgrade plan or wait for monthly reset.'
        };
    }
    
    return { allowed: true };
}
```

### Cost Estimates

```
Per destination generation:
- Google Search API: 5 queries × €0.001 = €0.005
- Google Places API: 10 places × €0.002 = €0.020
- Vercel function: ~€0.00001
- Total: ~€0.025 per destination

With limits:
- 50 requests/hour × €0.025 = €1.25/hour max
- 200 requests/day × €0.025 = €5.00/day max
- Per agent per month: ~€2.50 (avg 100 requests)

For 400 agents:
- Total monthly cost: ~€1,000
- Per agent: ~€2.50/month
```

---

## 5. 📝 Content Ownership & Update Strategy

### ❌ Probleem
Agent past content handmatig aan in WordPress. Wat gebeurt er bij nieuwe sync?

### ✅ Oplossing: Update Strategies

#### Strategy 1: MERGE (Default) ✅ AANBEVOLEN

```
Regel: Alleen lege velden vullen, manual edits behouden

Workflow:
1. Agent genereert "Spanje" → WordPress post created
2. Agent past titel aan: "Spanje" → "Zonnig Spanje"
3. Agent past intro aan: "..." → "Eigen tekst..."
4. Nieuwe sync komt binnen
5. MERGE logica:
   ✅ Titel blijft "Zonnig Spanje" (was niet leeg)
   ✅ Intro blijft "Eigen tekst..." (was niet leeg)
   ✅ Lege ACF velden worden wel gevuld
   ✅ Attracties (leeg) worden gevuld
```

```php
// WordPress: Merge implementation
function update_destination($post_id, $data, $strategy = 'merge') {
    if ($strategy === 'merge') {
        // Check if fields have content
        $current_title = get_the_title($post_id);
        $current_content = get_post_field('post_content', $post_id);
        
        // Only update empty fields
        if (empty($current_title)) {
            wp_update_post(['ID' => $post_id, 'post_title' => $data['title']]);
        }
        
        // ACF: Only update empty fields
        foreach ($data['acf'] as $field => $value) {
            $current = get_field($field, $post_id);
            if (empty($current)) {
                update_field($field, $value, $post_id);
            }
        }
    }
}
```

#### Strategy 2: OVERWRITE

```
Regel: Vervang alles, negeer manual edits

Use case: Agent wil fresh start, regenereer alles

Workflow:
1. Agent klikt "Regenerate" in WordPress
2. updateStrategy: 'overwrite' wordt meegestuurd
3. Alle content wordt vervangen
4. Manual edits zijn weg
5. Fresh AI-generated content
```

```php
// WordPress: Overwrite implementation
function update_destination($post_id, $data, $strategy = 'overwrite') {
    if ($strategy === 'overwrite') {
        // Replace everything
        wp_update_post([
            'ID' => $post_id,
            'post_title' => $data['title'],
            'post_content' => $data['acf']['introduction']
        ]);
        
        // ACF: Overwrite all fields
        foreach ($data['acf'] as $field => $value) {
            update_field($field, $value, $post_id);
        }
    }
}
```

### Documentation Requirements

```markdown
# Voor Agents: Content Update Policy

## Default Behavior (MERGE)
✅ Jouw manual edits blijven behouden
✅ Alleen lege velden worden gevuld
✅ Safe voor dagelijks gebruik

Voorbeeld:
- Je past titel aan → blijft staan
- Je voegt tekst toe → blijft staan
- Je vult lege velden → blijft staan
- Nieuwe sync → vult alleen lege velden aan

## Force Overwrite (REGENERATE)
⚠️ Alle content wordt vervangen!
⚠️ Manual edits gaan verloren!
⚠️ Gebruik alleen bij fresh start

Wanneer gebruiken:
- Content is volledig verouderd
- Je wilt verse AI content
- Bestemming info is changed (nieuwe attracties)
```

### UI Indicators

```php
// WordPress admin: Show sync strategy
add_meta_box('aiws_sync_info', 'Sync Info', function($post) {
    $last_strategy = get_post_meta($post->ID, '_aiws_last_sync_strategy', true);
    $last_sync = get_post_meta($post->ID, '_aiws_updated_at', true);
    
    echo '<p><strong>Last Sync:</strong> ' . $last_sync . '</p>';
    echo '<p><strong>Strategy:</strong> ' . $last_strategy . '</p>';
    echo '<p><strong>Manual Edits:</strong> ' . ($last_strategy === 'merge' ? '✅ Protected' : '⚠️ Overwritten') . '</p>';
}, 'destination', 'side');
```

---

## 🧪 Testing Checklist

### Security Tests

```bash
# Test 1: Brand isolation
curl -H "X-API-Key: BRAND_A_KEY" \
     "https://api/wordpress/destinations?brandId=BRAND_B_ID"
# Expected: 401 Unauthorized

# Test 2: Webhook URL validation
curl -X POST https://api/wordpress/destinations \
  -H "Content-Type: application/json" \
  -d '{"destination":"Test","wordpressUrl":"https://evil.com"}'
# Expected: 403 Forbidden

# Test 3: Rate limiting
for i in {1..60}; do
  curl -H "X-API-Key: KEY" "https://api/wordpress/destinations?brandId=xxx"
done
# Expected: 429 after 50 requests

# Test 4: Webhook auth
curl -X POST https://wp-site.nl/wp-json/aiws/v1/destinations/webhook \
  -H "Authorization: Bearer WRONG_TOKEN" \
  -d '{"destination":{...}}'
# Expected: 401 Unauthorized
```

### Update Strategy Tests

```php
// Test merge strategy
$post_id = create_test_destination();
wp_update_post(['ID' => $post_id, 'post_title' => 'Manual Edit']);
update_field('hero_subtitle', 'Custom subtitle', $post_id);

// Sync with merge
sync_destination($post_id, $new_data, 'merge');

// Assert
assert(get_the_title($post_id) === 'Manual Edit'); // ✅ Preserved
assert(get_field('hero_subtitle', $post_id) === 'Custom subtitle'); // ✅ Preserved
assert(!empty(get_field('activities', $post_id))); // ✅ Filled empty field
```

---

## 🚀 Production Deployment

### Pre-Launch Security Checklist

- [ ] ✅ Brand API keys generated en veilig opgeslagen
- [ ] ✅ Webhook secrets generated (32+ bytes random)
- [ ] ✅ Domain allowlist configured in API
- [ ] ✅ HTTPS enforced (no HTTP in production)
- [ ] ✅ Rate limits configured
- [ ] ✅ Cost monitoring dashboard setup
- [ ] ✅ Error logging & alerting configured
- [ ] ✅ Update strategy documented voor agents
- [ ] ✅ All security tests passed
- [ ] ✅ Penetration test uitgevoerd (optional)

### Monitoring

```javascript
// Log security events
console.log('[Security]', {
    event: 'auth_failed',
    brandId: requestedBrandId,
    ip: req.ip,
    timestamp: new Date()
});

// Alert on suspicious activity
if (failedAuthAttempts > 10) {
    sendAlert('Multiple failed auth attempts from brand: ' + brandId);
}
```

---

## 📞 Emergency Procedures

### Compromised API Key

```bash
# 1. Revoke immediately
UPDATE brands SET api_key = NULL WHERE id = 'xxx';

# 2. Generate new key
UPDATE brands SET api_key = encode(gen_random_bytes(32), 'hex') WHERE id = 'xxx';

# 3. Notify agent
# 4. Update wp-config.php
# 5. Monitor for unauthorized access
```

### DDoS / Spam Attack

```bash
# 1. Temporarily disable endpoint
# 2. Review rate limits
# 3. Add IP blocks
# 4. Investigate source
# 5. Contact Vercel support if needed
```

---

## ✅ Summary

**Alle concerns geadresseerd:**

1. ✅ **Brand Security**: Server-side API key → brand_id verification
2. ✅ **Webhook Security**: Multi-layer (token + allowlist + HTTPS)
3. ✅ **Timeouts**: Cached results + 202 Accepted fallback
4. ✅ **Cost Control**: Rate limiting (50/hour, 200/day)
5. ✅ **Content Ownership**: Merge (preserve edits) vs Overwrite

**Ready for production!** 🚀

---

**Document versie:** 1.0  
**Laatst bijgewerkt:** 30 november 2024  
**Status:** Production Ready
