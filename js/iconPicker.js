// Reusable Icon Picker using Font Awesome (v6 Free)
// Usage: IconPicker.open({ current: 'fa-plane' }).then(({ icon }) => { ... })

class IconPicker {
  static open({ current = '', compact = false } = {}) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.style.display = 'block';

      const content = document.createElement('div');
      content.className = 'modal-content';
      content.style.maxWidth = compact ? '520px' : '720px';

      const header = document.createElement('div');
      header.className = 'modal-header';
      header.innerHTML = `
        <h3>Choose an icon</h3>
        <button class="modal-close"><i class="fas fa-times"></i></button>
      `;

      const body = document.createElement('div');
      body.className = 'modal-body';
      body.innerHTML = `
        <div style="display:flex; gap:8px; align-items:center; margin-bottom:${compact ? '8px' : '12px'};">
          <input type="text" class="form-control ip-search" placeholder="Zoek (bv. plane, beach, map)" />
          <div class="ip-preview" style="min-width:${compact ? '36px' : '46px'}; text-align:center; font-size:${compact ? '18px' : '22px'}; color:#16a34a;"><i class="fas ${current}"></i></div>
        </div>
        <div class="ip-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(${compact ? '90px' : '110px'},1fr)); gap:${compact ? '8px' : '10px'}; max-height:${compact ? '360px' : '420px'}; overflow:auto;"></div>
      `;

      content.appendChild(header);
      content.appendChild(body);
      modal.appendChild(content);
      document.body.appendChild(modal);

      const close = () => { if (modal.parentNode) document.body.removeChild(modal); };
      header.querySelector('.modal-close').onclick = close;
      modal.onclick = (e) => { if (e.target === modal) close(); };

      const preview = body.querySelector('.ip-preview');
      const grid = body.querySelector('.ip-grid');
      const search = body.querySelector('.ip-search');

      const icons = IconPicker.getIconList();
      const render = (q = '') => {
        const query = q.trim().toLowerCase();
        grid.innerHTML = '';
        const filtered = icons.filter(it => it.label.includes(query) || it.value.includes(query));
        filtered.forEach(it => {
          const tile = document.createElement('div');
          tile.style.cssText = `display:flex; gap:${compact ? '8px' : '10px'}; align-items:center; padding:${compact ? '8px' : '10px'}; border:1px solid #e5e7eb; border-radius:8px; background:#f8f9fa; cursor:pointer; color:#333;`;
          tile.innerHTML = `<i class="fas ${it.value}" style="width:${compact ? '18px' : '22px'}; text-align:center; font-size:${compact ? '16px' : '18px'}; color:#16a34a;"></i> <span style="font-size:${compact ? '12px' : '13px'};">${it.label}</span>`;
          tile.onclick = () => { resolve({ icon: it.value }); close(); };
          grid.appendChild(tile);
        });
        if (filtered.length === 0) {
          grid.innerHTML = '<div style="color:#666;">Geen resultaten</div>';
        }
      };
      search.addEventListener('input', (e) => {
        render(e.target.value);
      });

      // Preview updates when typing an FA class directly
      let previewTimer;
      search.addEventListener('keyup', () => {
        const val = search.value.trim();
        if (previewTimer) clearTimeout(previewTimer);
        previewTimer = setTimeout(() => {
          if (val.startsWith('fa-')) {
            preview.innerHTML = `<i class="fas ${val}"></i>`;
          }
        }, 150);
      });

      render();

      // Ensure base modal styles look good on white background
      const style = document.createElement('style');
      style.textContent = `
        .modal .form-control.ip-search { background:#fff; color:#333; }
      `;
      document.head.appendChild(style);
    });
  }

  static getIconList() {
    const list = [
      // Travel & places
      { value: 'fa-plane', label: 'plane' },
      { value: 'fa-earth-americas', label: 'earth americas' },
      { value: 'fa-globe', label: 'globe' },
      { value: 'fa-location-dot', label: 'location dot' },
      { value: 'fa-map', label: 'map' },
      { value: 'fa-route', label: 'route' },
      { value: 'fa-compass', label: 'compass' },
      { value: 'fa-bed', label: 'bed / hotel' },
      { value: 'fa-car', label: 'car' },
      { value: 'fa-bus', label: 'bus' },
      { value: 'fa-train', label: 'train' },
      { value: 'fa-ship', label: 'ship' },
      { value: 'fa-umbrella-beach', label: 'beach' },
      { value: 'fa-water', label: 'water' },
      { value: 'fa-mountain', label: 'mountain' },
      { value: 'fa-tree', label: 'tree' },
      { value: 'fa-campground', label: 'campground' },
      { value: 'fa-person-biking', label: 'biking' },
      { value: 'fa-person-hiking', label: 'hiking' },
      { value: 'fa-binoculars', label: 'binoculars' },
      { value: 'fa-ticket', label: 'ticket' },
      { value: 'fa-passport', label: 'passport' },
      // General
      { value: 'fa-star', label: 'star' },
      { value: 'fa-heart', label: 'heart' },
      { value: 'fa-check', label: 'check' },
      { value: 'fa-xmark', label: 'times' },
      { value: 'fa-clock', label: 'clock' },
      { value: 'fa-dollar-sign', label: 'dollar sign' },
      { value: 'fa-tag', label: 'tag' },
      { value: 'fa-gem', label: 'gem' },
    ];
    return list.map(it => ({ ...it, label: it.label.toLowerCase() }));
  }
}

window.IconPicker = IconPicker;
