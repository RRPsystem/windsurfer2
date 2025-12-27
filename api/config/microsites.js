// API endpoint to manage multiple Travel Compositor microsites
// Each microsite can have its own credentials and display name

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Friendly display names for microsites
  const displayNames = {
    'rondreis-planner': 'Rondreis Planner',
    'reisbureaunederland': 'Blauw Versie RRP'
  };

  // Parse microsite configurations from environment variables
  // Format: TC_MICROSITES={"rondreis-planner":{"username":"user1","password":"pass1"},"reisbureaunederland":{"username":"user2","password":"pass2"}}
  
  const micrositesConfig = process.env.TC_MICROSITES ? 
    JSON.parse(process.env.TC_MICROSITES) : {};

  // Fallback to single microsite config for backward compatibility
  const defaultMicrosite = process.env.TC_MICROSITE_ID || 'rondreis-planner';
  const defaultUsername = process.env.TC_USERNAME || '';
  const defaultPassword = process.env.TC_PASSWORD || '';

  // If no multi-microsite config, use default
  if (Object.keys(micrositesConfig).length === 0 && defaultMicrosite) {
    micrositesConfig[defaultMicrosite] = {
      username: defaultUsername,
      password: defaultPassword
    };
  }

  // Check for numbered suffix pattern (TC_MICROSITE_ID_2, TC_USERNAME_2, etc.)
  for (let i = 2; i <= 10; i++) {
    const suffixedMicrositeId = process.env[`TC_MICROSITE_ID_${i}`];
    const suffixedUsername = process.env[`TC_USERNAME_${i}`];
    const suffixedPassword = process.env[`TC_PASSWORD_${i}`];
    
    if (suffixedMicrositeId && suffixedUsername && suffixedPassword) {
      micrositesConfig[suffixedMicrositeId] = {
        username: suffixedUsername,
        password: suffixedPassword
      };
    }
  }

  // Return list of available microsites (without passwords)
  const availableMicrosites = Object.keys(micrositesConfig).map(id => ({
    id,
    name: displayNames[id] || id, // Use friendly name if available, otherwise use ID
    hasCredentials: !!(micrositesConfig[id]?.username && micrositesConfig[id]?.password)
  }));

  res.status(200).json({
    microsites: availableMicrosites,
    baseUrl: process.env.TC_BASE_URL || 'https://online.travelcompositor.com'
  });
}
