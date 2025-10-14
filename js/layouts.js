// js/layouts.js
// Provides simple header/footer presets and helpers for preview rendering in the builder
(function(){
  const presets = {
    headers: {
      minimal: ({brandName = 'Brand', accent = '#16a34a', logoUrl = ''} = {}) => `
        <header class="wb-layout header-minimal" style="border-bottom:1px solid #e5e7eb;">
          <div class="wrap" style="max-width:1200px;margin:0 auto;padding:12px 16px;display:flex;align-items:center;gap:12px;">
            <a href="#" class="logo" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:#111;">
              ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" style="height:28px;width:auto;border-radius:4px;"/>` : ''}
              <strong style="font-size:18px;letter-spacing:.2px;">${brandName}</strong>
            </a>
            <nav style="margin-left:auto;display:flex;gap:16px;">
              <a href="#" style="text-decoration:none;color:#374151;">Home</a>
              <a href="#" style="text-decoration:none;color:#374151;">Over</a>
              <a href="#" style="text-decoration:none;color:#374151;">Contact</a>
            </nav>
            <a href="#" style="margin-left:8px;padding:8px 14px;border-radius:6px;background:${accent};color:#fff;text-decoration:none;font-weight:600;">Boek nu</a>
          </div>
        </header>
      `,
      centered: ({brandName = 'Brand', accent = '#16a34a', logoUrl = ''} = {}) => `
        <header class="wb-layout header-centered" style="border-bottom:1px solid #e5e7eb;">
          <div class="wrap" style="max-width:1200px;margin:0 auto;padding:14px 16px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;">
            <div></div>
            <a href="#" class="logo" style="justify-self:center;display:flex;align-items:center;gap:10px;text-decoration:none;color:#111;">
              ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" style="height:30px;width:auto;border-radius:4px;"/>` : ''}
              <strong style="font-size:18px;">${brandName}</strong>
            </a>
            <nav style="justify-self:end;display:flex;gap:16px;">
              <a href="#" style="text-decoration:none;color:#374151;">Reizen</a>
              <a href="#" style="text-decoration:none;color:#374151;">Blogs</a>
            </nav>
          </div>
        </header>
      `,
      transparent: ({brandName = 'Brand', accent = '#16a34a'} = {}) => `
        <header class="wb-layout header-transparent" style="position:sticky;top:0;z-index:20;background:rgba(255,255,255,0.65);backdrop-filter:saturate(180%) blur(8px);border-bottom:1px solid rgba(229,231,235,.6);">
          <div class="wrap" style="max-width:1200px;margin:0 auto;padding:10px 16px;display:flex;align-items:center;">
            <strong style="font-size:18px;">${brandName}</strong>
            <nav style="margin-left:auto;display:flex;gap:16px;">
              <a href="#" style="text-decoration:none;color:#111;">Bestemmingen</a>
              <a href="#" style="text-decoration:none;color:#111;">Inspireer mij</a>
            </nav>
            <a href="#" style="margin-left:8px;padding:8px 14px;border-radius:6px;background:${accent};color:#fff;text-decoration:none;font-weight:600;">Plan reis</a>
          </div>
        </header>
      `
    },
    footers: {
      compact: ({brandName = 'Brand'} = {}) => `
        <footer class="wb-layout footer-compact" style="border-top:1px solid #e5e7eb;margin-top:40px;">
          <div class="wrap" style="max-width:1200px;margin:0 auto;padding:20px 16px;display:flex;justify-content:space-between;color:#6b7280;font-size:14px;">
            <div>Â© ${new Date().getFullYear()} ${brandName}</div>
            <div style="display:flex;gap:12px;">
              <a href="#" style="color:#6b7280;text-decoration:none;">Privacy</a>
              <a href="#" style="color:#6b7280;text-decoration:none;">Voorwaarden</a>
              <a href="#" style="color:#6b7280;text-decoration:none;">Contact</a>
            </div>
          </div>
        </footer>
      `,
      three_cols: ({brandName = 'Brand'} = {}) => `
        <footer class="wb-layout footer-3cols" style="border-top:1px solid #e5e7eb;margin-top:60px;">
          <div class="wrap" style="max-width:1200px;margin:0 auto;padding:32px 16px;display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:20px;">
            <div>
              <strong style="font-size:18px;">${brandName}</strong>
              <p style="color:#6b7280;margin:10px 0;">Prachtige reizen op maat. Laat je inspireren.</p>
            </div>
            <div>
              <div style="font-weight:600;margin-bottom:8px;">Navigatie</div>
              <ul style="list-style:none;padding:0;margin:0;display:grid;gap:6px;">
                <li><a href="#" style="text-decoration:none;color:#374151;">Home</a></li>
                <li><a href="#" style="text-decoration:none;color:#374151;">Reizen</a></li>
                <li><a href="#" style="text-decoration:none;color:#374151;">Over ons</a></li>
              </ul>
            </div>
            <div>
              <div style="font-weight:600;margin-bottom:8px;">Contact</div>
              <ul style="list-style:none;padding:0;margin:0;display:grid;gap:6px;color:#374151;">
                <li>info@example.com</li>
                <li>+31 12 345 6789</li>
                <li>Amsterdam</li>
              </ul>
            </div>
          </div>
          <div style="border-top:1px solid #f3f4f6;color:#6b7280;font-size:14px;padding:10px 16px;max-width:1200px;margin:0 auto;">Â© ${new Date().getFullYear()} ${brandName}</div>
        </footer>
      `,
      dark: ({brandName = 'Brand'} = {}) => `
        <footer class="wb-layout footer-dark" style="background:#111827;color:#9ca3af;margin-top:60px;">
          <div class="wrap" style="max-width:1200px;margin:0 auto;padding:32px 16px;display:flex;justify-content:space-between;align-items:center;">
            <strong style="color:#fff;">${brandName}</strong>
            <div style="display:flex;gap:14px;">
              <a href="#" style="color:#9ca3af;text-decoration:none;">Privacy</a>
              <a href="#" style="color:#9ca3af;text-decoration:none;">Contact</a>
            </div>
          </div>
        </footer>
      `
    }
  };

  function getLayoutFromProject() {
    try {
      const saved = localStorage.getItem('wb_project');
      if (!saved) return null;
      const data = JSON.parse(saved);
      return data && data.layout ? data.layout : null;
    } catch (error) { 
      return null; 
    }
  }

  function renderWithLayout(bodyHtml, layout) {
    const effective = layout || getLayoutFromProject() || {};
    const brandName = effective.brandName || 'Brand';
    const accent = effective.accent || '#16a34a';
    const logoUrl = effective.logoUrl || '';
    const headerPreset = effective.headerPreset || 'minimal';
    const footerPreset = effective.footerPreset || 'compact';

    const headerFn = presets.headers[headerPreset] || presets.headers.minimal;
    const footerFn = presets.footers[footerPreset] || presets.footers.compact;

    const header = headerFn({brandName, accent, logoUrl});
    const footer = footerFn({brandName});

    return `${header}
    <main class="wb-layout main" style="min-height:50vh;">
      ${bodyHtml}
    </main>
${footer}`;
  }

  window.Layouts = {
    presets,
    renderWithLayout,
  };
})();
