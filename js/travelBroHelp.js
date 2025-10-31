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
      // Check for duplicate questions
      const lastUserMessage = this.messages.filter(m => m.role === 'user').slice(-1)[0];
      if (lastUserMessage && lastUserMessage.content === question) {
        return "Ik heb deze vraag net beantwoord! Heb je een andere vraag of wil je meer details?";
      }
      
      // Get context about the system
      const context = this.getSystemContext();
      
      // Get conversation history for context
      const conversationHistory = this.messages.slice(-4).map(m => ({
        role: m.role,
        content: m.content
      }));
      
      // Call OpenAI API
      const response = await fetch('/api/ai-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'help',
          question: question,
          context: context,
          history: conversationHistory,
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
      
      // Video Generator - specifieke vragen
      if (q.includes('video') && q.includes('achtergrond')) {
        return `Om een video als achtergrond te gebruiken in een hero blok:

1. **Maak eerst je video:**
   - Ga naar 🎬 Video Generator
   - Kies clips en genereer video
   - Download de video

2. **Upload naar media:**
   - Upload je video naar je media library
   - Kopieer de video URL

3. **Gebruik in Hero:**
   - Voeg een Hero component toe
   - Kies "Video achtergrond" optie
   - Plak de video URL
   - Stel overlay opacity in voor leesbaarheid

De video speelt automatisch af als achtergrond!`;
      }
      
      if (q.includes('video') || q.includes('clip')) {
        return `**Video Generator Snelgids:**

📍 **Waar vind je het?**
Klik op "🎬 Video Generator" in het dropdown menu bovenaan.

🎨 **Hoe werkt het?**
1. Kies een thema (🦁 Safari, 🏝️ Tropisch Strand, etc.)
2. Of zoek zelf met custom zoekterm
3. Selecteer clips door erop te klikken
4. Klik "Genereer Video"
5. Wacht 30-60 seconden op rendering
6. Download je video!

💡 **Pro tip:** Combineer clips van verschillende thema's voor unieke video's!`;
      }
      
      // AI Writer
      if (q.includes('ai') || q.includes('tekst') || q.includes('content')) {
        return `**AI Content Generator:**

✨ **Wat maakt het uniek?**
- Google Search research voor actuele info
- Google Places ratings (bijv: 4.7★, 12,453 reviews)
- Max 200 woorden per tekst
- Specifieke highlights per bestemming

📝 **Waar wordt het gebruikt?**
- "Over deze reis" sectie bij Travel import
- Automatisch gegenereerd per bestemming
- Geen duplicates meer!

🔧 **Werkt het niet?**
Check of Google Search en Places API keys zijn ingesteld in je .env file.`;
      }
      
      // Travel Import
      if (q.includes('import') || q.includes('reis') || q.includes('travel')) {
        return `**Reis Importeren:**

1. Selecteer "✈️ Reizen" in het menu
2. Klik op "Travel Compositor Import"
3. Voer je TC ID in (bijv: wlhn3idkb7)
4. Klik "Laden"

**Wat gebeurt er?**
- Bestemmingen worden geladen
- Hotels en accommodaties
- Transports en transfers
- Timeline wordt automatisch gegenereerd
- AI tekst wordt gegenereerd per bestemming

**Resultaat:** Complete reispagina met hero, intro, timeline en alle details!`;
      }
      
      // Brand & Layout
      if (q.includes('brand') || q.includes('kleur') || q.includes('menu') || q.includes('footer')) {
        return `**Brand & Layout Manager:**

📍 **Waar?** Klik op "🎨 Brand & Layout" in de header.

**3 Tabs:**

1. **Brand Tab:**
   - Stel brand kleuren in
   - Upload logo
   - Kies primaire/secundaire/accent kleuren
   
2. **Menu/Header Tab:**
   - Zie welk menu actief is (✓ ACTIEF)
   - Preview verschillende layouts
   - Activeer met één klik
   
3. **Footer Tab:**
   - Zie welke footer actief is
   - Kies tussen verschillende stijlen
   - Direct toepassen

**Voordeel:** Alles op één plek, duidelijke status indicators!`;
      }
      
      // CSS/Styling
      if (q.includes('css') || q.includes('styling') || q.includes('lelijk')) {
        return `**Styling Problemen Oplossen:**

**BOLT Preview lelijk?**
1. CSS moet inline in HTML staan
2. Zie BOLT_PREVIEW_FIX.md voor instructies
3. Deploy pages-preview edge function
4. CSS wordt automatisch inline gezet

**Lokaal geen styling?**
1. Check of server draait (localhost:8080)
2. Hard refresh: Ctrl+Shift+R
3. Check console voor CSS load errors

**Supabase deployment:**
Upload CSS naar Supabase Storage onder assets/styles/`;
      }
      
      // Default
      return `**Hoe kan ik helpen?**

Ik ken alles over:
- 🎬 **Video Generator** - Clips zoeken en video's maken
- 🤖 **AI Writer** - Unieke content genereren
- ✈️ **Travel Import** - Reizen laden van Travel Compositor
- 🎨 **Brand & Layout** - Kleuren, menu's en footers
- 🔧 **Troubleshooting** - Problemen oplossen

**Voorbeeldvragen:**
- "Hoe maak ik een video als achtergrond?"
- "Waarom zijn mijn AI teksten hetzelfde?"
- "Hoe activeer ik een ander menu?"
- "Waar vind ik de Video Generator?"

Stel gerust je vraag!`;
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
