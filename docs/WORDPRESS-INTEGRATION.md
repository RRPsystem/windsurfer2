# 🔗 WordPress Integratie Guide

Complete handleiding voor het koppelen van AI Website Studio Builder aan WordPress multisite voor bestemmingspagina's.

## 📋 Overzicht

### Architectuur

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Website Studio                        │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │   Builder    │─────▶│  Supabase    │                    │
│  │              │      │   Database   │                    │
│  └──────────────┘      └──────────────┘                    │
│         │                       │                           │
│         │                       │                           │
│         ▼                       ▼                           │
│  ┌──────────────────────────────────┐                      │
│  │   Vercel API Endpoints           │                      │
│  │   /api/wordpress/destinations    │                      │
│  └──────────────────────────────────┘                      │
└───────────────────┬──────────────────────────────────────────┘
                    │
                    │ HTTPS (REST API / Webhook)
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              WordPress Multisite                            │
│                                                              │
│  ┌──────────────────────────────────┐                      │
│  │  Plugin: AI Website Studio       │                      │
│  │  - Webhook Receiver               │                      │
│  │  - REST API Client                │                      │
│  │  - ACF Integration                │                      │
│  └──────────────────────────────────┘                      │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────┐                      │
│  │   Custom Post Type: Destination   │                      │
│  │   + ACF Fields                    │                      │
│  │   + Elementor Templates           │                      │
│  └──────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Twee Werkwijzen

### Methode A: PUSH (Aanbevolen)
**Builder → WordPress**

**Voordelen:**
- ✅ Instant synchronisatie
- ✅ Geen handmatige actie nodig
- ✅ Altijd up-to-date
- ✅ Schaalbaar voor 400+ agents

**Flow:**
1. Bestemming wordt gegenereerd in Builder
2. Builder roept WordPress webhook aan
3. WordPress ontvangt data via POST
4. Plugin creëert automatisch post met ACF velden
5. ✅ Klaar voor Elementor editing

**Implementatie:**
```javascript
// In Builder: Na destinatie generatie
const webhookUrl = 'https://jouw-wp-site.nl/wp-json/aiws/v1/destinations/webhook';
const webhookSecret = 'xxxxx';

await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${webhookSecret}`
  },
  body: JSON.stringify({
    destination: destinationData
  })
});
```

### Methode B: PULL (On-Demand)
**WordPress → Builder**

**Voordelen:**
- ✅ WordPress heeft controle
- ✅ Op elk moment nieuwe content ophalen
- ✅ Kan bestaande content refreshen

**Flow:**
1. WordPress admin klikt "Genereer Bestemming"
2. WordPress roept Builder API aan
3. Builder genereert content (10-30 sec)
4. WordPress ontvangt data en creëert post
5. ✅ Direct beschikbaar

**Implementatie:**
```php
// WordPress AJAX call
$response = wp_remote_post('https://www.ai-websitestudio.nl/api/wordpress/destinations', [
  'body' => json_encode([
    'brandId' => 'xxx',
    'destination' => 'Spanje',
    'generateContent' => true
  ])
]);

$data = json_decode(wp_remote_retrieve_body($response), true);
```

## 🛠️ Setup Stappen

### Stap 1: Plugin Installeren

```bash
# Upload naar WordPress
cd /wp-content/plugins/
# Upload de ai-website-studio-destinations folder

# Of via WP CLI
wp plugin install ai-website-studio-destinations.zip
wp plugin activate ai-website-studio-destinations
```

### Stap 2: ACF Pro Installeren

```bash
# Via WP CLI
wp plugin install advanced-custom-fields-pro --activate

# Of handmatig via WordPress admin
# 1. Download ACF PRO
# 2. Upload & Activeer
# 3. Importeer acf-export.json
```

### Stap 3: Plugin Configureren

1. **WordPress Admin → Bestemmingen → Instellingen**

2. **Vul in:**
   - **API URL**: `https://www.ai-websitestudio.nl`
   - **Brand ID**: `[jouw-brand-id-uit-builder]`
   - **Webhook Secret**: `[genereer-random-string]`

3. **Test de verbinding** met "Test API Verbinding" knop

### Stap 4: ACF Velden Importeren

1. **WordPress Admin → Custom Fields → Tools → Import**
2. Upload: `acf-export.json`
3. ✅ Alle velden zijn nu beschikbaar!

### Stap 5: Elementor Template Maken

1. **Elementor → Theme Builder → Single**
2. **Create New Template** voor `destination` post type
3. **Gebruik Dynamic Tags** voor ACF velden
4. **Publish & Set Conditions**

## 📡 API Endpoints

### 1. GET /api/wordpress/destinations
**Beschrijving:** Haal bestemmingen op uit Builder

**Parameters:**
- `brandId` (required) - Jouw Brand ID
- `slug` (optional) - Specifieke bestemming slug

**Response:**
```json
{
  "total": 5,
  "destinations": [
    {
      "title": "Spanje",
      "slug": "destination-spanje",
      "status": "draft",
      "acf": {
        "hero_title": "Ontdek Spanje",
        "hero_subtitle": "Beste reistijd: Mei - September",
        "hero_image": "https://...",
        "introduction": "...",
        "highlights": [...],
        "activities": [...],
        "attractions": [...],
        "culture_content": "...",
        "gallery": [...],
        "meta_description": "..."
      },
      "builder": {
        "id": "xxx",
        "brand_id": "xxx",
        "created_at": "2024-01-01T12:00:00Z"
      }
    }
  ]
}
```

**Voorbeeld:**
```bash
curl "https://www.ai-websitestudio.nl/api/wordpress/destinations?brandId=xxx&slug=destination-spanje"
```

### 2. POST /api/wordpress/destinations
**Beschrijving:** Genereer nieuwe bestemming en optioneel push naar WordPress

**Body:**
```json
{
  "brandId": "xxx",
  "destination": "Spanje",
  "wordpressUrl": "https://jouw-site.nl",
  "wordpressAuth": "Bearer xxx",
  "generateContent": true
}
```

**Response:**
```json
{
  "success": true,
  "destination": {
    "title": "Spanje",
    "slug": "destination-spanje",
    "acf": {...}
  },
  "wordpress": {
    "post_id": 123,
    "edit_url": "https://jouw-site.nl/wp-admin/post.php?post=123&action=edit",
    "view_url": "https://jouw-site.nl/bestemming/spanje/"
  }
}
```

**Voorbeeld:**
```bash
curl -X POST https://www.ai-websitestudio.nl/api/wordpress/destinations \
  -H "Content-Type: application/json" \
  -d '{
    "brandId": "xxx",
    "destination": "Bali",
    "generateContent": true
  }'
```

### 3. POST /wp-json/aiws/v1/destinations/webhook
**Beschrijving:** WordPress webhook endpoint (incoming push)

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer [webhook-secret]`

**Body:**
```json
{
  "destination": {
    "title": "Spanje",
    "slug": "destination-spanje",
    "acf": {...},
    "builder": {...}
  }
}
```

**Response:**
```json
{
  "success": true,
  "post_id": 123,
  "edit_url": "https://jouw-site.nl/wp-admin/post.php?post=123&action=edit",
  "view_url": "https://jouw-site.nl/bestemming/spanje/"
}
```

**Voorbeeld:**
```bash
curl -X POST https://jouw-site.nl/wp-json/aiws/v1/destinations/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret" \
  -d @destination-data.json
```

## 🔐 Security Best Practices

### 1. Webhook Secret
```php
// Genereer sterke secret
$secret = bin2hex(random_bytes(32));
// Bewaar in wp-config.php
define('AIWS_WEBHOOK_SECRET', $secret);
```

### 2. HTTPS Only
```php
// Force HTTPS voor API calls
if (!is_ssl() && !defined('WP_CLI')) {
  wp_die('HTTPS is required for this endpoint');
}
```

### 3. Rate Limiting
```php
// WordPress plugin: Limit requests
add_filter('rest_request_before_callbacks', function($response, $handler, $request) {
  if ($request->get_route() === '/aiws/v1/destinations/webhook') {
    // Check rate limit
    $ip = $_SERVER['REMOTE_ADDR'];
    $count = get_transient("aiws_rate_limit_{$ip}");
    
    if ($count && $count > 10) {
      return new WP_Error('rate_limit', 'Too many requests', ['status' => 429]);
    }
    
    set_transient("aiws_rate_limit_{$ip}", ($count ?: 0) + 1, MINUTE_IN_SECONDS);
  }
  
  return $response;
}, 10, 3);
```

### 4. Input Validation
```php
// Validate incoming data
function validate_destination_data($data) {
  if (empty($data['title'])) {
    return new WP_Error('invalid_data', 'Title is required');
  }
  
  if (empty($data['slug'])) {
    return new WP_Error('invalid_data', 'Slug is required');
  }
  
  // Sanitize all fields
  $data['title'] = sanitize_text_field($data['title']);
  $data['slug'] = sanitize_title($data['slug']);
  
  return $data;
}
```

## 🎨 Elementor Integration

### Dynamic Tags Voorbeeld

```php
<?php
/**
 * Elementor Dynamic Tag: Destination Hero Title
 */
class AIWS_Hero_Title_Tag extends \Elementor\Core\DynamicTags\Tag {
  
  public function get_name() {
    return 'aiws-hero-title';
  }
  
  public function get_title() {
    return 'Hero Titel';
  }
  
  public function get_group() {
    return 'aiws-destinations';
  }
  
  public function get_categories() {
    return [ \Elementor\Modules\DynamicTags\Module::TEXT_CATEGORY ];
  }
  
  public function render() {
    echo get_field('hero_title');
  }
}

// Register
add_action('elementor/dynamic_tags/register', function($dynamic_tags) {
  $dynamic_tags->register(new AIWS_Hero_Title_Tag());
});
```

### Widget Voorbeeld

```php
<?php
/**
 * Elementor Widget: Attractions Grid
 */
class AIWS_Attractions_Widget extends \Elementor\Widget_Base {
  
  public function get_name() {
    return 'aiws-attractions';
  }
  
  public function get_title() {
    return 'Attracties Grid';
  }
  
  protected function render() {
    if (have_rows('attractions')):
      echo '<div class="attractions-grid">';
      
      while (have_rows('attractions')): the_row();
        ?>
        <div class="attraction-card">
          <img src="<?php the_sub_field('image'); ?>" alt="<?php the_sub_field('name'); ?>">
          <h3><?php the_sub_field('name'); ?></h3>
          <div class="rating">
            ⭐ <?php the_sub_field('rating'); ?> 
            (<?php the_sub_field('reviews'); ?> reviews)
          </div>
          <p><?php the_sub_field('address'); ?></p>
          <?php if (get_sub_field('website')): ?>
            <a href="<?php the_sub_field('website'); ?>" target="_blank">Website →</a>
          <?php endif; ?>
        </div>
        <?php
      endwhile;
      
      echo '</div>';
    endif;
  }
}
```

## 🧪 Testing

### Test Script

```bash
#!/bin/bash
# test-wordpress-integration.sh

BUILDER_API="https://www.ai-websitestudio.nl/api/wordpress/destinations"
BRAND_ID="your-brand-id"
WP_WEBHOOK="https://your-wp-site.nl/wp-json/aiws/v1/destinations/webhook"
WP_SECRET="your-webhook-secret"

echo "🧪 Testing WordPress Integration"
echo "================================"

# Test 1: GET existing destinations
echo ""
echo "Test 1: Fetching destinations from Builder..."
curl -s "$BUILDER_API?brandId=$BRAND_ID" | jq .

# Test 2: POST generate new destination
echo ""
echo "Test 2: Generating new destination..."
curl -s -X POST "$BUILDER_API" \
  -H "Content-Type: application/json" \
  -d "{\"brandId\":\"$BRAND_ID\",\"destination\":\"Test Destination\",\"generateContent\":true}" \
  | jq .

# Test 3: POST webhook to WordPress
echo ""
echo "Test 3: Sending webhook to WordPress..."
curl -s -X POST "$WP_WEBHOOK" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $WP_SECRET" \
  -d @test-destination.json \
  | jq .

echo ""
echo "✅ Tests completed!"
```

### Test Data

```json
{
  "destination": {
    "title": "Test Bestemming",
    "slug": "destination-test",
    "status": "draft",
    "acf": {
      "hero_title": "Test Hero",
      "hero_subtitle": "Test Subtitle",
      "hero_image": "https://via.placeholder.com/1200x600",
      "introduction": "Dit is een test bestemming.",
      "highlights": [
        {
          "title": "Test Highlight",
          "description": "Dit is een test highlight.",
          "icon": "star"
        }
      ],
      "activities": [
        {
          "title": "Test Activiteit",
          "description": "Dit is een test activiteit.",
          "icon": "activity"
        }
      ],
      "attractions": [
        {
          "name": "Test Attractie",
          "rating": 4.5,
          "reviews": 100,
          "address": "Test Straat 1, Test Stad",
          "image": "https://via.placeholder.com/400x300"
        }
      ],
      "culture_content": "Test cultuur content.",
      "best_time_content": "Test beste reistijd.",
      "meta_description": "Test meta description."
    },
    "builder": {
      "id": "test-id",
      "brand_id": "test-brand-id",
      "created_at": "2024-01-01T12:00:00Z"
    }
  }
}
```

## 📊 Monitoring & Logging

### WordPress Logging

```php
// Enable debug logging
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);

// Custom logging function
function aiws_log($message, $data = null) {
  if (WP_DEBUG === true) {
    $log = '[AIWS] ' . $message;
    if ($data) {
      $log .= ': ' . print_r($data, true);
    }
    error_log($log);
  }
}

// Usage
aiws_log('Webhook received', $request_data);
```

### Builder Logging

```javascript
// In Builder: Log webhook responses
console.log('[AIWS] Webhook response:', {
  status: response.status,
  data: await response.json(),
  timestamp: new Date().toISOString()
});
```

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Plugin getest op staging environment
- [ ] ACF velden correct geconfigureerd
- [ ] Elementor templates gemaakt en getest
- [ ] API credentials veilig opgeslagen
- [ ] Webhook URLs correct ingesteld
- [ ] HTTPS enabled op beide systemen

### Post-Deployment
- [ ] Test API verbinding vanuit WordPress
- [ ] Test webhook met test data
- [ ] Genereer test bestemming
- [ ] Check Elementor rendering
- [ ] Monitor error logs (eerste 24u)
- [ ] Performance check (page load times)

## 🔧 Troubleshooting

### Probleem: "API verbinding mislukt"
**Oplossing:**
1. Check of API URL correct is
2. Verify Brand ID
3. Test met curl: `curl -I https://www.ai-websitestudio.nl/api/wordpress/destinations`
4. Check firewall/security plugins

### Probleem: "Webhook ontvangt geen data"
**Oplossing:**
1. Check webhook URL (moet `/wp-json/aiws/v1/destinations/webhook` zijn)
2. Verify Authorization header
3. Check WordPress permalink settings (moet "Post name" zijn)
4. Test met Postman/curl

### Probleem: "ACF velden worden niet gevuld"
**Oplossing:**
1. Verify ACF Pro is installed & active
2. Check of ACF velden correct geïmporteerd zijn
3. Test met: `get_field('hero_title', $post_id)`
4. Check ACF field names (exact match nodig)

### Probleem: "Afbeeldingen laden niet"
**Oplossing:**
1. Check of `allow_url_fopen` enabled is
2. Verify image URLs zijn valid en bereikbaar
3. Check WordPress media permissions
4. Test met: `media_sideload_image()` handmatig

## 📈 Performance Optimizatie

### Caching
```php
// Cache API responses
function get_cached_destinations($brand_id) {
  $cache_key = "aiws_destinations_{$brand_id}";
  $cached = get_transient($cache_key);
  
  if ($cached !== false) {
    return $cached;
  }
  
  $destinations = fetch_destinations_from_api($brand_id);
  set_transient($cache_key, $destinations, HOUR_IN_SECONDS);
  
  return $destinations;
}
```

### Lazy Loading
```php
// Lazy load images in Elementor template
add_filter('wp_get_attachment_image_attributes', function($attr) {
  if (!isset($attr['loading'])) {
    $attr['loading'] = 'lazy';
  }
  return $attr;
});
```

### Database Indexing
```sql
-- Add indexes for better query performance
ALTER TABLE wp_postmeta 
ADD INDEX idx_aiws_slug (meta_key(20), meta_value(50));

ALTER TABLE wp_postmeta 
ADD INDEX idx_aiws_brand_id (meta_key(20), meta_value(36));
```

## 🎓 Next Steps

1. **✅ Implementeer basis functionaliteit**
   - Plugin installeren
   - API configureren
   - Test generatie

2. **🎨 Maak Elementor templates**
   - Single destination template
   - Archive/overzicht template
   - Search/filter functionaliteit

3. **🔄 Setup automatische sync**
   - Webhook configureren in Builder
   - Test met meerdere bestemmingen
   - Monitor logs

4. **📊 Rollout naar agents**
   - Documentatie delen
   - Training sessies
   - Support kanaal opzetten

5. **🚀 Schalen**
   - Multisite configuratie
   - Bulk import tools
   - Analytics dashboard

---

**Vragen?** Zie `/wordpress-plugin/ai-website-studio-destinations/README.md` of neem contact op via support.

**Gemaakt:** 30 november 2024  
**Versie:** 1.0.0
