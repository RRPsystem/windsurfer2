// API endpoint to manage multiple Travel Compositor microsites
// Each microsite can have its own credentials

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

  // Return list of available microsites (without passwords)
  const availableMicrosites = Object.keys(micrositesConfig).map(id => ({
    id,
    hasCredentials: !!(micrositesConfig[id]?.username && micrositesConfig[id]?.password)
  }));

  res.status(200).json({
    microsites: availableMicrosites,
    baseUrl: process.env.TC_BASE_URL || 'https://online.travelcompositor.com'
  });
}
