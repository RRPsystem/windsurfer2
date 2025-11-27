// Simple test endpoint to verify deployment works
export default function handler(req, res) {
  const timestamp = new Date().toISOString();
  const host = req.headers.host;
  
  res.status(200).json({
    status: 'OK',
    message: 'Deployment is working!',
    timestamp: timestamp,
    host: host,
    deployment_version: 'v2024-11-26-21:34',
    path: req.url
  });
}
