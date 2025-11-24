(function() {
    'use strict';

    const CONFIG = {
        supabaseUrl: 'https://huaaogdxxdcakxryecnw.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YWFvZ2R4eGRjYWt4cnllY253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDY2OTAsImV4cCI6MjA3OTI2NjY5MH0.ygqwQNOpbJqe9NHtlxLCIlmVk2j5Mkcw4qvMpkGyeY0'
    };

    function getConfigFromElement(el) {
        const mode = (el.dataset.mode || 'trips').toLowerCase();
        const layout = (el.dataset.layout || 'grid').toLowerCase();
        const brandId = el.dataset.brandId || document.querySelector('meta[name="brand-id"]')?.content || null;

        return { mode, layout, brandId };
    }

    function buildApiUrl(mode, brandId) {
        // Use existing Vercel API endpoints instead of Supabase Edge Functions
        const base = window.location.origin;
        if (mode === 'destinations') return `${base}/api/content/destinations?brand_id=${encodeURIComponent(brandId)}`;
        if (mode === 'news') return `${base}/api/content/news?brand_id=${encodeURIComponent(brandId)}`;
        return `${base}/api/trips?brand_id=${encodeURIComponent(brandId)}`;
    }

    async function fetchItems(mode, brandId) {
        if (!brandId) {
            console.warn('travel-search: No brand_id provided');
            return [];
        }
        const url = buildApiUrl(mode, brandId);
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return Array.isArray(data) ? data : (data.items || data.data || []);
        } catch (e) {
            console.error('travel-search: Failed to fetch items', e);
            return [];
        }
    }

    function renderSkeleton(el) {
        el.innerHTML = `
            <div class="ts-wrapper">
                <div class="ts-search-bar">
                    <input type="text" class="ts-input ts-input-query" placeholder="Zoek op bestemming of titel...">
                    <select class="ts-input ts-input-sort">
                        <option value="recent">Meest recent</option>
                        <option value="price_asc">Prijs laag - hoog</option>
                        <option value="price_desc">Prijs hoog - laag</option>
                    </select>
                </div>
                <div class="ts-results ts-results-empty">Laden...</div>
            </div>
        `;
    }

    function renderItems(el, mode, items) {
        const container = el.querySelector('.ts-results');
        if (!container) return;
        if (!items.length) {
            container.classList.add('ts-results-empty');
            container.innerHTML = 'Geen resultaten gevonden.';
            return;
        }
        container.classList.remove('ts-results-empty');
        container.innerHTML = items.map(item => renderCardHtml(mode, item)).join('');
    }

    function renderCardHtml(mode, item) {
        const title = item.title || item.name || 'Zonder titel';
        const img = item.image_url || item.cover_image || item.hero_image || '';
        const desc = (item.summary || item.subtitle || item.excerpt || '').slice(0, 120);
        const price = item.price_from || item.price || null;
        const link = item.slug || item.url || '#';

        return `
            <article class="ts-card">
                ${img ? `<div class="ts-card-image" style="background-image:url('${img}')"></div>` : ''}
                <div class="ts-card-body">
                    <h3 class="ts-card-title">${title}</h3>
                    ${desc ? `<p class="ts-card-text">${desc}</p>` : ''}
                    <div class="ts-card-footer">
                        ${price ? `<span class="ts-card-price">vanaf € ${price}</span>` : ''}
                        <a href="${link}" class="ts-card-button">Meer info</a>
                    </div>
                </div>
            </article>
        `;
    }

    function applyBasicStyles() {
        if (document.getElementById('ts-widget-styles')) return;
        const style = document.createElement('style');
        style.id = 'ts-widget-styles';
        style.textContent = `
            .ts-wrapper{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;display:flex;flex-direction:column;gap:1rem}
            .ts-search-bar{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.5rem}
            .ts-input{padding:.5rem .75rem;border:1px solid #e2e8f0;border-radius:.5rem;font-size:.9rem}
            .ts-input-query{flex:1 1 200px}
            .ts-input-sort{flex:0 0 180px}
            .ts-results{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
            .ts-results-empty{text-align:center;color:#64748b;font-size:.9rem}
            .ts-card{background:white;border-radius:.75rem;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,.1);display:flex;flex-direction:column}
            .ts-card-image{width:100%;padding-top:60%;background-size:cover;background-position:center}
            .ts-card-body{padding:1rem;display:flex;flex-direction:column;gap:.5rem}
            .ts-card-title{font-size:1rem;font-weight:600;color:#0f172a}
            .ts-card-text{font-size:.85rem;color:#64748b}
            .ts-card-footer{display:flex;justify-content:space-between;align-items:center;margin-top:.5rem}
            .ts-card-price{font-weight:600;color:#16a34a;font-size:.9rem}
            .ts-card-button{padding:.45rem .9rem;border-radius:999px;border:none;background:#2563eb;color:white;font-size:.85rem;text-decoration:none}
            .ts-card-button:hover{background:#1d4ed8}
        `;
        document.head.appendChild(style);
    }

    async function initWidget(el) {
        const { mode, layout, brandId } = getConfigFromElement(el);
        console.log('travel-search: init', { mode, layout, brandId });
        renderSkeleton(el);
        applyBasicStyles();

        const items = await fetchItems(mode, brandId);
        renderItems(el, mode, items);

        const queryInput = el.querySelector('.ts-input-query');
        const sortInput = el.querySelector('.ts-input-sort');
        if (queryInput || sortInput) {
            const allItems = items.slice();
            const applyFilter = () => {
                let filtered = allItems;
                const q = (queryInput?.value || '').toLowerCase();
                const sort = sortInput?.value || 'recent';

                if (q) {
                    filtered = filtered.filter(it => {
                        const t = (it.title || it.name || '').toLowerCase();
                        const d = (it.summary || it.subtitle || it.excerpt || '').toLowerCase();
                        return t.includes(q) || d.includes(q);
                    });
                }

                if (sort === 'price_asc') {
                    filtered = filtered.slice().sort((a,b)=>(a.price_from||a.price||0)-(b.price_from||b.price||0));
                } else if (sort === 'price_desc') {
                    filtered = filtered.slice().sort((a,b)=>(b.price_from||b.price||0)-(a.price_from||a.price||0));
                } else {
                    filtered = filtered.slice().sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0));
                }

                renderItems(el, mode, filtered);
            };

            queryInput?.addEventListener('input', () => {
                clearTimeout(queryInput._tsTimer);
                queryInput._tsTimer = setTimeout(applyFilter, 200);
            });
            sortInput?.addEventListener('change', applyFilter);
        }
    }

    function initAll() {
        const nodes = document.querySelectorAll('#travel-search-widget, .travel-search-widget');
        nodes.forEach(el => initWidget(el));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
