// TravelBro Help Assistant
// AI-powered help system that knows everything about the Website Builder

(function() {
  const TravelBroHelp = {
    isOpen: false,
    messages: [],
    
    init() {
      this.createUI();
      this.attachEventListeners();
      this.addWelcomeMessage();
    },
    
    createUI() {
      const helpWidget = document.createElement('div');
      helpWidget.id = 'travelBroHelp';
      helpWidget.innerHTML = `
        <!-- Help Button (Bottom Right) -->
        <button id="travelBroToggle" style="
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
          border: none;
          box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4);
          cursor: pointer;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        ">
          <i class="fas fa-question" style="font-size: 24px; color: white;"></i>
        </button>
        
        <!-- Help Panel -->
        <div id="travelBroPanel" style="
          position: fixed;
          bottom: 100px;
          right: 24px;
          width: 400px;
          height: 600px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          display: none;
          flex-direction: column;
          z-index: 9998;
          overflow: hidden;
        ">
          <!-- Header -->
          <div style="
            background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
            padding: 20px;
            color: white;
          ">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="
                  width: 40px;
                  height: 40px;
                  background: rgba(255, 255, 255, 0.2);
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  <i class="fas fa-robot" style="font-size: 20px;"></i>
                </div>
                <div>
                  <div style="font-weight: 700; font-size: 18px;">TravelBro Help</div>
                  <div style="font-size: 12px; opacity: 0.9;">Altijd beschikbaar</div>
                </div>
              </div>
              <button id="travelBroClose" style="
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <!-- Messages -->
          <div id="travelBroMessages" style="
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: #f9fafb;
          "></div>
          
          <!-- Input -->
          <div style="
            padding: 16px;
            background: white;
            border-top: 1px solid #e5e7eb;
          ">
            <div style="display: flex; gap: 8px;">
              <input 
                type="text" 
                id="travelBroInput" 
                placeholder="Stel een vraag..."
                style="
                  flex: 1;
                  padding: 12px 16px;
                  border: 1px solid #d1d5db;
                  border-radius: 8px;
                  font-size: 14px;
                  outline: none;
                "
              />
              <button id="travelBroSend" style="
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
                border: none;
                border-radius: 8px;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
            <div style="font-size: 11px; color: #9ca3af; margin-top: 8px;">
              Tip: Enter = versturen, Shift+Enter = nieuwe regel
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(helpWidget);
    },
    
    attachEventListeners() {
      const toggle = document.getElementById('travelBroToggle');
      const close = document.getElementById('travelBroClose');
      const input = document.getElementById('travelBroInput');
      const send = document.getElementById('travelBroSend');
      
      toggle?.addEventListener('click', () => this.toggle());
      close?.addEventListener('click', () => this.close());
      send?.addEventListener('click', () => this.sendMessage());
      
      input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
      
      // Hover effect on toggle button
      toggle?.addEventListener('mouseenter', () => {
        toggle.style.transform = 'scale(1.1)';
      });
      toggle?.addEventListener('mouseleave', () => {
        toggle.style.transform = 'scale(1)';
      });
    },
    
    toggle() {
      const panel = document.getElementById('travelBroPanel');
      if (!panel) return;
      
      this.isOpen = !this.isOpen;
      panel.style.display = this.isOpen ? 'flex' : 'none';
      
      if (this.isOpen) {
        document.getElementById('travelBroInput')?.focus();
      }
    },
    
    close() {
      this.isOpen = false;
      const panel = document.getElementById('travelBroPanel');
      if (panel) panel.style.display = 'none';
    },
    
    addWelcomeMessage() {
      this.addMessage('assistant', `Hallo! Ik ben de TravelBro Help Assistant. Ik ken alle ins en outs van dit systeem en kan je helpen met vragen over functionaliteiten, instellingen, en problemen oplossen. Waar kan ik je mee helpen?`);
    },
    
    addMessage(role, content) {
      const messagesContainer = document.getElementById('travelBroMessages');
      if (!messagesContainer) return;
      
      const isUser = role === 'user';
      const time = new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
      
      const messageEl = document.createElement('div');
      messageEl.style.cssText = `
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
        ${isUser ? 'flex-direction: row-reverse;' : ''}
      `;
      
      messageEl.innerHTML = `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${isUser ? '#6366f1' : 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)'};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        ">
          <i class="fas fa-${isUser ? 'user' : 'robot'}"></i>
        </div>
        <div style="flex: 1;">
          <div style="
            background: ${isUser ? '#6366f1' : 'white'};
            color: ${isUser ? 'white' : '#111827'};
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.5;
            ${isUser ? '' : 'box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);'}
          ">
            ${content}
          </div>
          <div style="font-size: 11px; color: #9ca3af; margin-top: 4px; ${isUser ? 'text-align: right;' : ''}">
            ${time}
          </div>
        </div>
      `;
      
      messagesContainer.appendChild(messageEl);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      this.messages.push({ role, content, time });
    },
    
    async sendMessage() {
      const input = document.getElementById('travelBroInput');
      if (!input) return;
      
      const message = input.value.trim();
      if (!message) return;
      
      // Add user message
      this.addMessage('user', message);
      input.value = '';
      
      // Show typing indicator
      this.showTyping();
      
      // Get AI response
      try {
        const response = await this.getAIResponse(message);
        this.hideTyping();
        this.addMessage('assistant', response);
      } catch (error) {
        this.hideTyping();
        this.addMessage('assistant', 'Sorry, er ging iets mis. Probeer het opnieuw!');
      }
    },
    
    showTyping() {
      const messagesContainer = document.getElementById('travelBroMessages');
      if (!messagesContainer) return;
      
      const typingEl = document.createElement('div');
      typingEl.id = 'typingIndicator';
      typingEl.style.cssText = 'display: flex; gap: 12px; margin-bottom: 16px;';
      typingEl.innerHTML = `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        ">
          <i class="fas fa-robot"></i>
        </div>
        <div style="
          background: white;
          padding: 12px 16px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        ">
          <div style="display: flex; gap: 4px;">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      `;
      
      messagesContainer.appendChild(typingEl);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    
    hideTyping() {
      const typingEl = document.getElementById('typingIndicator');
      if (typingEl) typingEl.remove();
    },
    
    async getAIResponse(question) {
      // Get context about the system
      const context = this.getSystemContext();
      
      // Call OpenAI API
      const response = await fetch('/api/ai-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'help',
          question: question,
          context: context,
          language: 'nl'
        })
      });
      
      if (!response.ok) {
        throw new Error('API call failed');
      }
      
      const data = await response.json();
      return data.answer || this.getFallbackResponse(question);
    },
    
    getSystemContext() {
      return `
Je bent TravelBro Help Assistant voor een Website Builder systeem.

FEATURES:
- Video Generator: Maak video's met Pexels clips en Shotstack rendering
  - Thema buttons: Safari, Skiën, Hiking, Mountain Bike, Cruise, Roadtrip, Tropisch Strand
  - Custom search voor eigen zoektermen
  - Clips selecteren en video genereren
  
- AI Writer: Genereert unieke content met Google Search en Places
  - Gebruikt ratings zoals "4.7★, 12,453 reviews"
  - Max 200 woorden per tekst
  - Geen duplicates
  
- Travel Compositor Import: Importeer reizen via TC ID
  - Bestemmingen, hotels, transports, transfers
  - Automatische timeline generatie
  
- Components: Hero, Travel Cards, Timeline, Content blocks
  
- BOLT Deployment: CSS via Supabase Storage, Edge Functions

SHORTCUTS:
- Enter = versturen
- Shift+Enter = nieuwe regel
- Ctrl+S = opslaan
- Ctrl+P = preview

TROUBLESHOOTING:
- CSS laadt niet? Check Supabase Storage
- Video faalt? Check Shotstack API key
- AI tekst generiek? Zorg dat Google Search/Places keys zijn ingesteld
      `;
    },
    
    getFallbackResponse(question) {
      const q = question.toLowerCase();
      
      // Video Generator
      if (q.includes('video') || q.includes('clip')) {
        return `Om een video te maken:
1. Klik op "Video Generator" in het menu
2. Kies een thema (🦁 Safari, 🏝️ Tropisch Strand, etc.) of zoek zelf
3. Selecteer clips uit Pexels
4. Klik "Genereer Video"
5. Wacht op rendering (via Shotstack)
6. Download je video!

Je kunt meerdere clips combineren van verschillende thema's.`;
      }
      
      // AI Writer
      if (q.includes('ai') || q.includes('tekst') || q.includes('content')) {
        return `De AI Writer genereert nu unieke content met:
- Google Search research voor highlights
- Google Places voor ratings (4.7★, 12,453 reviews)
- Max 200 woorden per tekst
- Specifieke details per bestemming

Elke bestemming krijgt unieke content, geen duplicates meer!`;
      }
      
      // Travel Import
      if (q.includes('import') || q.includes('reis') || q.includes('travel')) {
        return `Om een reis te importeren:
1. Ga naar "Reizen" mode
2. Kies "Travel Compositor" import methode
3. Voer je TC ID in (bijv: wlhn3idkb7)
4. Klik "Laden"
5. De reis wordt automatisch geladen met alle bestemmingen, hotels, etc.

De timeline wordt automatisch gegenereerd!`;
      }
      
      // CSS/Styling
      if (q.includes('css') || q.includes('styling') || q.includes('lelijk')) {
        return `Als pagina's er lelijk uitzien (geen styling):
1. Check of CSS files in Supabase Storage staan
2. Zie BOLT_INSTRUCTIONS.md voor upload stappen
3. Verifieer dat edge function de juiste CSS URLs gebruikt
4. Clear browser cache (Ctrl+Shift+R)

De CSS moet in Supabase Storage staan onder assets/styles/`;
      }
      
      // Default
      return `Ik kan je helpen met:
- Video Generator (clips zoeken, video maken)
- AI Writer (unieke content genereren)
- Travel Compositor import
- Components en layout
- BOLT deployment
- Troubleshooting

Stel gerust een specifieke vraag!`;
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TravelBroHelp.init());
  } else {
    TravelBroHelp.init();
  }
  
  // Add CSS for typing animation
  const style = document.createElement('style');
  style.textContent = `
    .typing-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #9ca3af;
      animation: typing 1.4s infinite;
    }
    .typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }
    .typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }
    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.7;
      }
      30% {
        transform: translateY(-10px);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Expose globally
  window.TravelBroHelp = TravelBroHelp;
})();
