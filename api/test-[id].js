// Super simple test route to verify Vercel dynamic routing works
export default function handler(req, res) {
  const { id } = req.query;
  
  return res.status(200).json({
    success: true,
    message: 'Dynamic route works!',
    id: id,
    query: req.query,
    url: req.url
  });
}
