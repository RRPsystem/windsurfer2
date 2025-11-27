# 🔄 BOLT Token Refresh Endpoint Implementation

**Status:** Builder side ✅ LIVE | BOLT side 📋 To Implement  
**Feature:** Sliding Window Token Refresh (Enterprise UX)

---

## 🎯 What This Solves

**Problem:**
- User works for 2+ hours on a page
- JWT token expires (2 hour limit)
- User clicks save → "Session expired" ❌
- Bad UX!

**Solution:**
- Token automatically refreshes in background
- User never sees "session expired"
- Works seamlessly for hours ✅
- Perfect UX! 🎉

---

## ✅ Builder Side (Already Live)

**Auto-refresh behavior:**
```javascript
// Checks token every 60 seconds
// Refreshes when <10 minutes left
// User sees NOTHING - completely transparent

// Console output:
🔄 Token refresh monitoring started
🔄 Token expires in 9 minutes, refreshing...
✅ Token successfully refreshed!
```

**API call retry:**
```javascript
// If API call gets 401
→ Automatically refresh token
→ Retry request with new token
→ User doesn't notice anything
```

---

## 📋 BOLT Side (To Implement)

### Step 1: Create Refresh Token Endpoint

**File:** `/api/auth/refresh-token` or integrate in existing auth service

```typescript
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

interface JWTPayload {
  userId: string;
  brandId: string;
  email: string;
  role?: string;
  iat: number;
  exp: number;
}

export async function refreshToken(req: Request, res: Response) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const oldToken = authHeader?.replace('Bearer ', '');
    
    if (!oldToken) {
      return res.status(401).json({ 
        error: 'No token provided' 
      });
    }
    
    // Decode token WITHOUT verification (we check expiry ourselves)
    const decoded = jwt.decode(oldToken) as JWTPayload;
    
    if (!decoded) {
      return res.status(401).json({ 
        error: 'Invalid token format' 
      });
    }
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    const expiredAt = decoded.exp;
    
    // Grace period: Allow refresh up to 5 minutes after expiry
    const gracePeriod = 5 * 60; // 5 minutes
    const timeSinceExpiry = now - expiredAt;
    
    if (timeSinceExpiry > gracePeriod) {
      console.log(`Token expired ${timeSinceExpiry} seconds ago, beyond grace period`);
      return res.status(401).json({ 
        error: 'Token expired beyond grace period',
        expired_at: new Date(expiredAt * 1000).toISOString()
      });
    }
    
    // Verify token signature (even if expired)
    try {
      jwt.verify(oldToken, process.env.JWT_SECRET!, {
        ignoreExpiration: true // We already checked expiry above
      });
    } catch (error) {
      console.error('Token signature verification failed:', error);
      return res.status(401).json({ 
        error: 'Invalid token signature' 
      });
    }
    
    // Check if user still exists and is active
    const user = await getUserById(decoded.userId);
    if (!user || !user.active) {
      return res.status(401).json({ 
        error: 'User not found or inactive' 
      });
    }
    
    // Issue new token with fresh expiry
    const newToken = jwt.sign(
      {
        userId: decoded.userId,
        brandId: decoded.brandId,
        email: decoded.email,
        role: decoded.role
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: '2h', // Same as original token
        issuer: 'bolt-platform',
        audience: 'website-builder'
      }
    );
    
    // Log refresh event (optional but recommended)
    await logSecurityEvent({
      event_type: 'token_refreshed',
      user_id: decoded.userId,
      brand_id: decoded.brandId,
      old_token_exp: new Date(expiredAt * 1000),
      new_token_exp: new Date((now + (2 * 60 * 60)) * 1000),
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });
    
    console.log(`✅ Token refreshed for user ${decoded.email}`);
    
    // Return new token
    res.json({ 
      token: newToken,
      expires_at: new Date((now + (2 * 60 * 60)) * 1000).toISOString()
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      error: 'Internal server error during token refresh' 
    });
  }
}

// Helper function (adjust to your DB structure)
async function getUserById(userId: string) {
  // Example with Supabase
  const { data } = await supabase
    .from('users')
    .select('id, email, active')
    .eq('id', userId)
    .single();
  
  return data;
}

// Helper function (adjust to your logging setup)
async function logSecurityEvent(event: any) {
  // Example with Supabase
  await supabase
    .from('security_events')
    .insert({
      event_type: event.event_type,
      user_id: event.user_id,
      brand_id: event.brand_id,
      ip_address: event.ip_address,
      user_agent: event.user_agent,
      message: `Token refreshed`,
      metadata: event
    });
}
```

---

### Step 2: Register Route

**Express:**
```typescript
import express from 'express';
import { refreshToken } from './auth/refresh-token';

const app = express();

// Public endpoint - authentication via Bearer token in request
app.post('/api/auth/refresh-token', refreshToken);

// OR if you prefer edge functions:
// app.post('/functions/v1/refresh-token', refreshToken);
```

**NestJS:**
```typescript
@Controller('auth')
export class AuthController {
  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    return refreshToken(req, res);
  }
}
```

---

### Step 3: CORS Configuration

**Important:** Allow Builder domain to call refresh endpoint

```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://www.ai-websitestudio.nl',
    'https://templates.ai-websitestudio.nl',
    'http://localhost:3000' // For development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey']
}));
```

---

## 🧪 Testing Guide

### Test 1: Normal Refresh (Before Expiry)

```bash
# 1. Generate a token with short expiry for testing
const testToken = jwt.sign(
  { userId: 'test', brandId: 'test', email: 'test@test.com' },
  process.env.JWT_SECRET,
  { expiresIn: '2m' } // 2 minutes for testing
);

# 2. Wait 1 minute 50 seconds

# 3. Test refresh endpoint
curl -X POST https://api.bolt.com/auth/refresh-token \
  -H "Authorization: Bearer ${testToken}" \
  -H "Content-Type: application/json"

# Expected response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2025-11-27T20:00:00.000Z"
}
```

### Test 2: Grace Period Refresh (After Expiry)

```bash
# 1. Generate token
const testToken = jwt.sign(..., { expiresIn: '1m' });

# 2. Wait 2 minutes (token is expired)

# 3. Try refresh
curl -X POST https://api.bolt.com/auth/refresh-token \
  -H "Authorization: Bearer ${testToken}"

# Expected: ✅ Should still work (within 5 min grace period)
```

### Test 3: Beyond Grace Period

```bash
# 1. Generate token
const testToken = jwt.sign(..., { expiresIn: '1m' });

# 2. Wait 7 minutes (beyond grace period)

# 3. Try refresh
curl -X POST https://api.bolt.com/auth/refresh-token \
  -H "Authorization: Bearer ${testToken}"

# Expected response: 401
{
  "error": "Token expired beyond grace period"
}
```

### Test 4: Builder Integration (End-to-End)

```bash
# 1. Open editor with deeplink
https://www.ai-websitestudio.nl/simple-template-editor.html?token=xxx&...

# 2. Open DevTools Console

# 3. Wait until token is <10 min from expiry

# Expected console output:
🔄 Token refresh monitoring started
(... 50 minutes of silence ...)
🔄 Token expires in 9 minutes, refreshing...
✅ Token successfully refreshed!

# 4. Continue working - should work seamlessly
```

---

## 📊 Monitoring Queries

### Check Refresh Activity

```sql
-- How many tokens are being refreshed?
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as refresh_count,
  COUNT(DISTINCT user_id) as unique_users
FROM security_events
WHERE event_type = 'token_refreshed'
  AND created_at > now() - interval '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

### Identify Frequent Refreshers

```sql
-- Users refreshing tokens frequently
SELECT 
  user_id,
  email,
  COUNT(*) as refresh_count,
  MIN(created_at) as first_refresh,
  MAX(created_at) as last_refresh
FROM security_events
WHERE event_type = 'token_refreshed'
  AND created_at > now() - interval '7 days'
GROUP BY user_id, email
HAVING COUNT(*) > 10
ORDER BY refresh_count DESC;
```

---

## 🔒 Security Considerations

### ✅ Safe Practices

1. **Grace Period:** Limited to 5 minutes (configurable)
2. **Signature Verification:** Always verify token signature
3. **User Validation:** Check user still exists and is active
4. **Logging:** Log all refresh attempts for audit
5. **Rate Limiting:** Consider rate limiting per user

### ⚠️ Important Notes

- Don't accept tokens expired >5 minutes (configurable)
- Always verify user is still active
- Log refresh events for security monitoring
- Consider rate limiting (e.g., max 100 refreshes/hour per user)

### 🚫 Do NOT

- Accept tokens with invalid signatures
- Allow refresh for deleted/inactive users
- Skip user validation
- Allow unlimited refresh attempts

---

## 🐛 Troubleshooting

### Issue: "No token provided"

**Cause:** Authorization header missing

**Fix:**
```typescript
// Ensure Builder sends:
headers: {
  'Authorization': `Bearer ${this.token}`
}
```

### Issue: "Invalid token signature"

**Cause:** JWT secret mismatch

**Fix:**
```typescript
// Ensure same JWT_SECRET used for sign and verify
process.env.JWT_SECRET === 'your-secret-here'
```

### Issue: "Token expired beyond grace period"

**Cause:** User away from editor >2 hours 5 minutes

**Fix:** 
- This is expected behavior
- User must log back into BOLT
- Consider extending grace period if needed

### Issue: CORS error

**Cause:** Builder domain not in CORS whitelist

**Fix:**
```typescript
origin: [
  'https://www.ai-websitestudio.nl', // ← Add this
  // ...
]
```

---

## 📈 Performance Impact

**Overhead per refresh:**
- 1x JWT decode (~0.5ms)
- 1x JWT verify (~1ms)
- 1x Database user lookup (~5-20ms)
- 1x JWT sign (~1ms)
- 1x Database log insert (~5-20ms)

**Total:** ~15-50ms per refresh

**Frequency:**
- Average user: 1 refresh per 2 hours
- Active editor: 1 refresh per 2 hours
- Minimal performance impact

---

## 🎉 Benefits

**For Users:**
- ✅ Never see "session expired" errors
- ✅ Can work for hours without interruption
- ✅ Seamless experience

**For Business:**
- ✅ Better user retention
- ✅ Fewer support tickets
- ✅ Professional enterprise experience

**For Security:**
- ✅ Tokens still expire (not infinite)
- ✅ Fingerprint binding still active
- ✅ Full audit trail
- ✅ Grace period prevents abuse

---

## 🚀 Deployment Checklist

### BOLT Team
- [ ] Create `/api/auth/refresh-token` endpoint
- [ ] Implement grace period logic (5 min)
- [ ] Add user validation
- [ ] Configure CORS for Builder domain
- [ ] Test with curl
- [ ] Test end-to-end with Builder
- [ ] Monitor logs for refresh activity
- [ ] Document endpoint in API docs

### Optional Enhancements
- [ ] Add rate limiting (100/hour per user)
- [ ] Add IP validation (same IP as original token)
- [ ] Add monitoring dashboard
- [ ] Add alerts for suspicious refresh patterns

---

## 📞 Support

**Questions?**
- Slack: #builder-security
- Email: dev@ai-travelstudio.nl

**Current Status:**
- ✅ Builder ready (live now)
- 📋 BOLT endpoint (waiting for implementation)
- ⏱️ ETA: ~2 hours implementation time

---

**Version:** 1.0  
**Last Updated:** Nov 27, 2025  
**Status:** Builder ✅ Live | BOLT 📋 Pending
