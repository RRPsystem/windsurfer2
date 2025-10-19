// Domain Setup Guide for Travel Agencies
(function() {
    function openDomainSetupGuide() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.maxWidth = '700px';
        
        const brandId = window.CURRENT_BRAND_ID || 'jouw-reisbureau';
        const subdomain = `${brandId}.ai-travelstudio.nl`;
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-globe"></i> Koppel je Eigen Domein</h3>
                <button class="modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body" style="max-height:70vh;overflow-y:auto;">
                
                <!-- Current Status -->
                <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px;margin-bottom:24px;">
                    <div style="font-weight:600;margin-bottom:8px;">✅ Je website is nu bereikbaar via:</div>
                    <div style="font-family:monospace;background:#fff;padding:8px;border-radius:4px;margin-top:8px;">
                        https://${subdomain}
                    </div>
                    <div style="font-size:12px;color:#0369a1;margin-top:8px;">
                        💡 Dit is je tijdelijke URL. Volg onderstaande stappen om je eigen domein te koppelen.
                    </div>
                </div>

                <!-- Step 1 -->
                <div style="margin-bottom:32px;">
                    <h4 style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                        <span style="background:#667eea;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;">1</span>
                        Kies je Domein
                    </h4>
                    <p style="color:#6b7280;margin-bottom:12px;">
                        Heb je al een domein (bijv. <code>jouwreisbureau.nl</code>)? Of wil je een nieuw domein registreren?
                    </p>
                    <div style="background:#fef3c7;border:1px solid #fde047;border-radius:6px;padding:12px;font-size:13px;">
                        <strong>💡 Tip:</strong> Registreer je domein bij een provider zoals:
                        <ul style="margin:8px 0 0 20px;">
                            <li>TransIP.nl</li>
                            <li>Hostnet.nl</li>
                            <li>Mijndomein.nl</li>
                        </ul>
                    </div>
                </div>

                <!-- Step 2 -->
                <div style="margin-bottom:32px;">
                    <h4 style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                        <span style="background:#667eea;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;">2</span>
                        DNS Instellingen Aanpassen
                    </h4>
                    <p style="color:#6b7280;margin-bottom:12px;">
                        Log in bij je domein provider en voeg deze DNS records toe:
                    </p>
                    
                    <!-- DNS Records Table -->
                    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:16px;">
                        <table style="width:100%;border-collapse:collapse;">
                            <thead>
                                <tr style="background:#f1f5f9;">
                                    <th style="padding:12px;text-align:left;font-size:13px;font-weight:600;">Type</th>
                                    <th style="padding:12px;text-align:left;font-size:13px;font-weight:600;">Naam</th>
                                    <th style="padding:12px;text-align:left;font-size:13px;font-weight:600;">Waarde</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-top:1px solid #e5e7eb;">
                                    <td style="padding:12px;font-family:monospace;font-size:13px;">CNAME</td>
                                    <td style="padding:12px;font-family:monospace;font-size:13px;">www</td>
                                    <td style="padding:12px;font-family:monospace;font-size:13px;color:#667eea;">${subdomain}</td>
                                </tr>
                                <tr style="border-top:1px solid #e5e7eb;">
                                    <td style="padding:12px;font-family:monospace;font-size:13px;">A</td>
                                    <td style="padding:12px;font-family:monospace;font-size:13px;">@</td>
                                    <td style="padding:12px;font-family:monospace;font-size:13px;color:#667eea;">185.199.108.153</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Copy Buttons -->
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button class="btn btn-secondary btn-small" onclick="navigator.clipboard.writeText('${subdomain}'); alert('CNAME waarde gekopieerd!')">
                            <i class="fas fa-copy"></i> Kopieer CNAME
                        </button>
                        <button class="btn btn-secondary btn-small" onclick="navigator.clipboard.writeText('185.199.108.153'); alert('A record gekopieerd!')">
                            <i class="fas fa-copy"></i> Kopieer A Record
                        </button>
                    </div>

                    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:12px;font-size:13px;margin-top:16px;">
                        <strong>⚠️ Let op:</strong> DNS wijzigingen kunnen 24-48 uur duren voordat ze wereldwijd actief zijn.
                    </div>
                </div>

                <!-- Step 3 -->
                <div style="margin-bottom:32px;">
                    <h4 style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                        <span style="background:#667eea;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;">3</span>
                        Domein Registreren in Bolt
                    </h4>
                    <p style="color:#6b7280;margin-bottom:12px;">
                        Ga naar Bolt CMS en registreer je domein:
                    </p>
                    <ol style="color:#6b7280;margin-left:20px;">
                        <li style="margin-bottom:8px;">Open <strong>Instellingen</strong> → <strong>Domein</strong></li>
                        <li style="margin-bottom:8px;">Voer je domein in: <code>jouwreisbureau.nl</code></li>
                        <li style="margin-bottom:8px;">Klik <strong>Verifiëren</strong></li>
                        <li>Wacht op bevestiging (kan 24-48 uur duren)</li>
                    </ol>
                </div>

                <!-- Step 4 -->
                <div style="margin-bottom:32px;">
                    <h4 style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                        <span style="background:#667eea;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;">4</span>
                        SSL Certificaat (HTTPS)
                    </h4>
                    <p style="color:#6b7280;margin-bottom:12px;">
                        Voor een veilige verbinding (🔒 HTTPS) wordt automatisch een SSL certificaat aangemaakt.
                    </p>
                    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:12px;font-size:13px;">
                        <strong>✅ Automatisch geregeld:</strong>
                        <ul style="margin:8px 0 0 20px;">
                            <li>Let's Encrypt SSL certificaat</li>
                            <li>Automatische vernieuwing</li>
                            <li>HTTP → HTTPS redirect</li>
                        </ul>
                    </div>
                </div>

                <!-- Help Section -->
                <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">
                    <h4 style="margin-bottom:12px;"><i class="fas fa-question-circle"></i> Hulp Nodig?</h4>
                    <p style="color:#6b7280;font-size:14px;margin-bottom:12px;">
                        Lukt het niet? Neem contact op met support:
                    </p>
                    <div style="display:flex;gap:12px;flex-wrap:wrap;">
                        <a href="mailto:support@ai-travelstudio.nl" class="btn btn-secondary btn-small">
                            <i class="fas fa-envelope"></i> Email Support
                        </a>
                        <a href="https://docs.ai-travelstudio.nl/domein-koppelen" target="_blank" class="btn btn-secondary btn-small">
                            <i class="fas fa-book"></i> Handleiding
                        </a>
                    </div>
                </div>

            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Close handlers
        const closeBtn = modalContent.querySelector('.modal-close');
        const closeModal = () => document.body.removeChild(modal);
        closeBtn.onclick = closeModal;
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
    }
    
    // Add "Domein Koppelen" button to header
    function addDomainButton() {
        const headerRight = document.querySelector('.header-right');
        if (!headerRight) return;
        
        // Check if button already exists
        if (document.getElementById('domainSetupBtn')) return;
        
        const btn = document.createElement('button');
        btn.id = 'domainSetupBtn';
        btn.className = 'btn btn-secondary';
        btn.innerHTML = '<i class="fas fa-globe"></i> Domein Koppelen';
        btn.title = 'Koppel je eigen domein aan deze website';
        btn.onclick = openDomainSetupGuide;
        
        // Insert before save button
        const saveBtn = document.getElementById('saveProjectBtn');
        if (saveBtn && saveBtn.parentElement === headerRight) {
            headerRight.insertBefore(btn, saveBtn);
        } else {
            headerRight.appendChild(btn);
        }
        
        console.log('✅ Domain setup button added');
    }
    
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addDomainButton);
    } else {
        setTimeout(addDomainButton, 1000); // Wait for header to be ready
    }
    
    // Expose for external use
    window.openDomainSetupGuide = openDomainSetupGuide;
})();
