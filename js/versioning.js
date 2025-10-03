(function(){
  // Simple cache-busting via commit SHA from /api/version
  const qs = new URLSearchParams(location.search);
  const currentV = qs.get('v') || '';

  fetch('/api/version', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : null)
    .then(info => {
      const sha = info && info.git && info.git.commitSha ? info.git.commitSha.substring(0,8) : '';
      if (!sha) return; // nothing we can do
      window.__WB_COMMIT__ = sha;
      const stored = localStorage.getItem('wb_commit');
      if (stored !== sha) {
        localStorage.setItem('wb_commit', sha);
        // If URL already has correct v, do nothing; else add and reload once
        if (currentV !== sha) {
          qs.set('v', sha);
          const url = location.pathname + '?' + qs.toString() + location.hash;
          // avoid infinite loop if something goes wrong by storing a flag
          if (!sessionStorage.getItem('wb_ver_reload')) {
            sessionStorage.setItem('wb_ver_reload', '1');
            location.replace(url);
          }
        }
      } else {
        // Clear one-shot reload flag after successful load on same sha
        sessionStorage.removeItem('wb_ver_reload');
      }
    })
    .catch(() => {
      // ignore errors; app works without versioning
    });
})();
