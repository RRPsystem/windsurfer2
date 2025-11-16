# BOLT Domain Integration - Preview & Live URLs

## 📋 Overzicht

Template websites krijgen automatisch:
- **Preview URL**: `brand-slug.ai-websitestudio.nl` (automatisch)
- **Live URL**: `www.custom-domain.nl` (optioneel, via brand settings)

## 🔄 Complete Flow

```
1. Website maken in Template Editor
   ↓
2. Klik "Publiceren"
   ↓
3. Automatisch preview URL:
   brand-slug.ai-websitestudio.nl
   ↓
4. Terug naar BOLT
   ↓
5. BOLT toont:
   - Preview URL (direct klikbaar)
   - "Publiceer naar Live" knop
   ↓
6. Klik "Publiceer naar Live"
   ↓
7. Website live op:
   www.custom-domain.nl
```

## 💾 Database Schema

### Websites Table Updates

```sql
-- Migration 003: Add URL columns
ALTER TABLE websites 
ADD COLUMN preview_url TEXT,
ADD COLUMN live_url TEXT,
ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'preview', 'live'));

CREATE INDEX idx_websites_preview_url ON websites(preview_url);
CREATE INDEX idx_websites_live_url ON websites(live_url);
CREATE INDEX idx_websites_status ON websites(status);
```

### Website Object

```typescript
interface Website {
    id: string;
    brand_id: string;
    template: string;
    pages: Page[];
    
    // URLs
    preview_url: string;  // brand-slug.ai-websitestudio.nl
    live_url?: string;    // www.custom-domain.nl
    
    // Status
    status: 'draft' | 'preview' | 'live';
    
    // Timestamps
    created_at: string;
    updated_at: string;
    published_at?: string;
}
```

## 🎨 BOLT UI Implementation

### QuickStartWebsite Component

```typescript
import { useState } from 'react';
import { ExternalLink, Globe, Eye } from 'lucide-react';

function WebsiteCard({ website, brand }: Props) {
    const [isPublishing, setIsPublishing] = useState(false);
    
    const handlePublishToLive = async () => {
        if (!brand.domain) {
            toast.error('Configureer eerst een domein in Brand Settings');
            return;
        }
        
        if (!confirm(`Website publiceren naar ${brand.domain}?`)) {
            return;
        }
        
        setIsPublishing(true);
        
        try {
            // Call Vercel API to add custom domain
            const response = await fetch('/api/vercel/add-domain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain: brand.domain,
                    websiteId: website.id,
                    type: 'live'
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to publish to live domain');
            }
            
            const data = await response.json();
            
            // Update website in database
            await supabase
                .from('websites')
                .update({
                    live_url: brand.domain,
                    status: 'live',
                    published_at: new Date().toISOString()
                })
                .eq('id', website.id);
            
            toast.success(`Website live op ${brand.domain}!`);
            
            // Refresh data
            refetch();
            
        } catch (error) {
            console.error('Publish error:', error);
            toast.error('Fout bij publiceren naar live domein');
        } finally {
            setIsPublishing(false);
        }
    };
    
    return (
        <div className="website-card">
            <div className="website-header">
                <h3>{website.template}</h3>
                <span className="status-badge" data-status={website.status}>
                    {website.status === 'live' ? '🟢 Live' : 
                     website.status === 'preview' ? '🟡 Preview' : 
                     '⚪ Draft'}
                </span>
            </div>
            
            <div className="website-info">
                <p>{website.pages?.length || 0} pagina's</p>
                <p className="text-sm text-gray-500">
                    Laatst bijgewerkt: {formatDate(website.updated_at)}
                </p>
            </div>
            
            {/* Preview URL - Always visible */}
            <div className="url-section">
                <label className="url-label">
                    <Eye size={16} /> Preview URL
                </label>
                <div className="url-display">
                    <code className="url-code">{website.preview_url}</code>
                    <a 
                        href={`https://${website.preview_url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="url-button"
                    >
                        <ExternalLink size={16} />
                    </a>
                </div>
            </div>
            
            {/* Live URL - Conditional */}
            <div className="url-section">
                <label className="url-label">
                    <Globe size={16} /> Live URL
                </label>
                {website.live_url ? (
                    <div className="url-display">
                        <code className="url-code">{website.live_url}</code>
                        <a 
                            href={`https://${website.live_url}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="url-button"
                        >
                            <ExternalLink size={16} />
                        </a>
                    </div>
                ) : (
                    <div className="publish-section">
                        {brand.domain ? (
                            <button 
                                onClick={handlePublishToLive}
                                disabled={isPublishing}
                                className="publish-button"
                            >
                                {isPublishing ? (
                                    <>⏳ Publiceren...</>
                                ) : (
                                    <>📤 Publiceer naar {brand.domain}</>
                                )}
                            </button>
                        ) : (
                            <div className="no-domain-warning">
                                <p>Geen domein geconfigureerd</p>
                                <Link to="/brand/settings" className="configure-link">
                                    Configureer domein →
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Actions */}
            <div className="website-actions">
                <button onClick={() => editWebsite(website)} className="action-button">
                    ✏️ Bewerken
                </button>
                <button onClick={() => deleteWebsite(website)} className="action-button danger">
                    🗑️ Verwijderen
                </button>
            </div>
        </div>
    );
}
```

### CSS Styling

```css
.website-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
}

.website-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.status-badge[data-status="live"] {
    background: #d4edda;
    color: #155724;
}

.status-badge[data-status="preview"] {
    background: #fff3cd;
    color: #856404;
}

.url-section {
    margin: 16px 0;
}

.url-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #666;
    margin-bottom: 8px;
}

.url-display {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
}

.url-code {
    flex: 1;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    color: #667eea;
}

.url-button {
    padding: 4px 8px;
    background: #667eea;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.url-button:hover {
    background: #5568d3;
}

.publish-button {
    width: 100%;
    padding: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.publish-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.publish-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.no-domain-warning {
    padding: 12px;
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 6px;
    text-align: center;
}

.configure-link {
    color: #667eea;
    font-weight: 600;
    text-decoration: none;
}

.configure-link:hover {
    text-decoration: underline;
}
```

## 🔧 API Endpoints

### POST /api/vercel/add-domain

Adds custom domain to Vercel project.

**Request:**
```json
{
    "domain": "www.custom-domain.nl",
    "websiteId": "uuid",
    "type": "live"
}
```

**Response:**
```json
{
    "success": true,
    "domain": "www.custom-domain.nl",
    "type": "live",
    "message": "Domain successfully configured"
}
```

## 🧪 Test Scenario

### 1. Create Website
```typescript
// User creates website in template editor
// Clicks "Publiceren"
// Returns to BOLT with preview URL
```

### 2. View Preview
```typescript
// In BOLT, click preview URL
// Opens: brand-slug.ai-websitestudio.nl
// Website is live in preview mode
```

### 3. Publish to Live
```typescript
// In BOLT, click "Publiceer naar Live"
// Vercel adds custom domain
// Website is now live on www.custom-domain.nl
```

## 📝 Environment Variables

```env
# Vercel Configuration
VERCEL_TOKEN=your_vercel_token
VERCEL_PROJECT_ID=website-builder

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
```

## 🚀 Deployment Checklist

- [ ] Run database migration 003
- [ ] Add VERCEL_TOKEN to environment
- [ ] Deploy API endpoint `/api/vercel/add-domain`
- [ ] Update BOLT QuickStartWebsite component
- [ ] Test preview URL generation
- [ ] Test live domain publishing
- [ ] Document DNS instructions for users

## 💡 Tips

**Preview URLs:**
- Automatically generated from brand slug
- Always available immediately
- No configuration needed
- Perfect for testing

**Live URLs:**
- Requires brand domain in settings
- DNS must be configured
- SSL automatically via Vercel
- Production ready

**Status Flow:**
```
draft → preview → live
```

## 📞 Support

For issues:
1. Check Vercel dashboard for domain status
2. Verify DNS configuration
3. Check browser console for errors
4. Review Supabase logs

**Everything is ready to implement!** 🎉
