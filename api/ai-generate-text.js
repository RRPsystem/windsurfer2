// API endpoint for AI text generation using OpenAI
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, context, maxLength } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY not configured');
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Build system message based on context
    let systemMessage = 'Je bent een professionele copywriter die aantrekkelijke en boeiende teksten schrijft voor websites. Schrijf in het Nederlands.';
    
    if (context) {
      systemMessage += `\n\nContext: Dit is voor een ${context} element op een website.`;
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxLength || 500,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ OpenAI API error:', error);
      return res.status(response.status).json({ 
        error: 'OpenAI API error', 
        details: error 
      });
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content?.trim();

    if (!generatedText) {
      return res.status(500).json({ error: 'No text generated' });
    }

    console.log('✅ Text generated:', generatedText.substring(0, 100) + '...');

    return res.status(200).json({
      text: generatedText,
      usage: data.usage
    });

  } catch (error) {
    console.error('❌ Error generating text:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
