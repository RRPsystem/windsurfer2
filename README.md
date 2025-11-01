# 🎨 Website Builder

Een moderne, gebruiksvriendelijke website builder waarmee je prachtige websites kunt maken zonder code te schrijven!

## ✨ Latest Update
- Country-specific destination pages with fallback data

## ✨ Features

- **🖱️ Drag & Drop Interface**: Sleep componenten eenvoudig naar je canvas
- **📱 Responsive Design**: Test je website op desktop, tablet en mobiel
- **🎨 Live Editing**: Bewerk tekst en eigenschappen direct in de browser
- **🧩 Component Library**: Uitgebreide collectie van herbruikbare componenten
- **💾 Auto-Save**: Je werk wordt automatisch opgeslagen
- **📤 Export Functionaliteit**: Download je website als HTML of ZIP bestand
- **⌨️ Keyboard Shortcuts**: Sneltoetsen voor efficiënt werken
- **🎯 Properties Panel**: Geavanceerde styling opties voor elk component

## 🚀 Aan de slag

### Voor bezoekers
1. Ga naar `https://www.ai-websitestudio.nl/` voor de landing page
2. Klik op "Start nu gratis" om de builder te openen

### Direct naar de builder
1. Open `builder.html` in je webbrowser (of ga naar `/builder.html` op de live site)
2. Sleep componenten van de zijbalk naar het canvas
3. Klik op componenten om ze te selecteren en bewerken
4. Gebruik het properties panel om styling aan te passen
5. Test je website op verschillende apparaten
6. Exporteer je website wanneer je klaar bent

### Deeplinks
Deeplinks met parameters (zoals `?ctx=...` of `?api=...`) worden automatisch doorgestuurd van de landing page naar de builder.

## 🧩 Beschikbare Componenten

### Layout Componenten
- **Container**: Basis wrapper voor content
- **Rij**: Horizontale layout container
- **Kolom**: Verticale sectie binnen een rij

### Content Componenten
- **Titel**: H1-H6 headings met verschillende groottes
- **Tekst**: Paragrafen en tekst content
- **Afbeelding**: Afbeeldingen met upload functionaliteit
- **Knop**: Klikbare buttons met verschillende stijlen

### Media Componenten
- **Video**: YouTube en Vimeo video embeds
- **Galerij**: Afbeelding galerijen met grid layout

## ⌨️ Sneltoetsen

- `Ctrl/Cmd + S`: Project opslaan
- `Ctrl/Cmd + Z`: Ongedaan maken
- `Ctrl/Cmd + Shift + Z`: Opnieuw uitvoeren
- `Ctrl/Cmd + E`: Export modal openen
- `Ctrl/Cmd + P`: Preview tonen
- `Delete`: Geselecteerd element verwijderen
- `Esc`: Selectie opheffen
- `Ctrl/Cmd + D`: Geselecteerd element dupliceren

## 🎯 Hoe te gebruiken

### Basis Website Maken
1. **Start met een Container**: Sleep een container component naar het canvas
2. **Voeg een Rij toe**: Sleep een rij component in de container
3. **Voeg Kolommen toe**: Kolommen worden automatisch toegevoegd aan rijen
4. **Voeg Content toe**: Sleep tekst, afbeeldingen, buttons etc. in de kolommen

### Componenten Bewerken
1. **Selecteren**: Klik op een component om het te selecteren
2. **Properties Panel**: Gebruik het rechter panel om eigenschappen aan te passen
3. **Direct Bewerken**: Klik op tekst om het direct te bewerken
4. **Toolbar**: Gebruik de toolbar boven componenten voor snelle acties

### Responsive Design
1. **Device Selector**: Gebruik de knoppen bovenaan om verschillende apparaten te simuleren
2. **Automatische Aanpassingen**: De builder past automatisch layout aan voor kleinere schermen
3. **Preview**: Gebruik de preview functie om je website te testen

## 📤 Exporteren

### HTML Export
- Exporteert een enkele HTML file met inline CSS
- Perfect voor eenvoudige websites
- Inclusief alle styling en functionaliteit

### ZIP Export
- Exporteert HTML en CSS als aparte bestanden
- Beter voor complexere websites
- Makkelijker te onderhouden en aan te passen

### Export Opties
- **Bootstrap CSS**: Voeg Bootstrap framework toe
- **Animaties**: Inclusief CSS animaties en JavaScript
- **Responsive Design**: Mobile-first responsive styling
- **Code Minimalisatie**: Gecomprimeerde code voor snellere laadtijden

## 🛠️ Technische Details

### Gebruikte Technologieën
- **HTML5**: Moderne markup
- **CSS3**: Flexbox, Grid, Animaties
- **Vanilla JavaScript**: Geen externe dependencies
- **Font Awesome**: Iconen
- **Drag & Drop API**: HTML5 native drag and drop

### Browser Ondersteuning
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Bestandsstructuur
```
website-builder/
├── index.html              # Hoofd HTML bestand
├── styles/
│   ├── main.css            # Basis styling
│   └── components.css      # Component styling
├── js/
│   ├── main.js             # Hoofd JavaScript
│   ├── components.js       # Component factory
│   ├── dragdrop.js         # Drag & drop functionaliteit
│   ├── properties.js       # Properties panel
│   └── export.js           # Export functionaliteit
└── README.md               # Deze documentatie
```

## 🎨 Customization

### Eigen Componenten Toevoegen
Je kunt eenvoudig nieuwe componenten toevoegen door:
1. Een nieuwe methode toe te voegen aan `ComponentFactory`
2. CSS styling toe te voegen in `components.css`
3. Het component toe te voegen aan de sidebar in `index.html`

### Styling Aanpassen
- Pas `main.css` aan voor algemene styling
- Pas `components.css` aan voor component-specifieke styling
- Gebruik CSS custom properties voor consistente kleuren en spacing

## 🐛 Troubleshooting

### Algemene Problemen
- **Drag & drop werkt niet**: Zorg dat JavaScript is ingeschakeld
- **Componenten laden niet**: Check de browser console voor errors
- **Export werkt niet**: Controleer of pop-ups zijn toegestaan

### Performance Tips
- Gebruik niet te veel complexe componenten op één pagina
- Optimaliseer afbeeldingen voor web gebruik
- Test regelmatig in verschillende browsers

## 🤝 Bijdragen

Dit is een open-source project! Bijdragen zijn welkom:
1. Fork het project
2. Maak een feature branch
3. Commit je wijzigingen
4. Push naar de branch
5. Open een Pull Request

## 📄 Licentie

Dit project is gelicenseerd onder de MIT License - zie het LICENSE bestand voor details.

## 🙏 Credits

- Font Awesome voor de iconen
- Moderne CSS Grid en Flexbox voor layouts
- HTML5 Drag & Drop API voor de drag functionaliteit

---

**Veel plezier met het bouwen van je website! 🚀**

Voor vragen of ondersteuning, open een issue in de GitHub repository.
