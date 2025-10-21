const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

function htmlToText(html) {
  if (!html) return '';
  // Remove scripts and styles
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                 .replace(/<style[\s\S]*?<\/style>/gi, '');
  // Replace <br> and block-level tags with line breaks
  text = text.replace(/<(br|BR)\s*\/?>(\s*)/g, '\n');
  text = text.replace(/<\/(p|div|h\d|li|ul|ol|section|article)>/gi, '\n');
  // Strip remaining tags
  text = text.replace(/<[^>]+>/g, '');
  // Decode a few common HTML entities
  const entities = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };
  text = text.replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (m) => entities[m] || '');
  // Collapse excessive whitespace
  return text.replace(/\n{3,}/g, '\n\n').trim();
}

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    console.log('Received chat request with', Array.isArray(messages) ? messages.length : 0, 'messages');

    // Proxy to usul.ai unauthenticated endpoint
    const upstream = await fetch('https://usul.ai/api/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': 'text/plain, text/event-stream, */*',
        'origin': 'https://usul.ai',
        'referer': 'https://usul.ai/chat',
      },
      body: JSON.stringify({ messages }),
    });

    const contentType = upstream.headers.get('content-type') || '';
    if (upstream.body) {
      // If HTML, sanitize to plain text
      if (contentType.includes('text/html')) {
        const html = await upstream.text();
        const plain = htmlToText(html);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(plain);
        return;
      }

      // Forward text or event-stream as-is
      if (contentType.includes('text') || contentType.includes('event-stream')) {
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'no-cache');
        if (typeof upstream.body.pipe === 'function') {
          upstream.body.pipe(res);
        } else {
          const text = await upstream.text();
          res.end(text);
        }
        return;
      }
    }

    // Fallback to mock if upstream doesn't return expected text
    const userMessage = Array.isArray(messages) ? messages[messages.length - 1] : null;
    const question = userMessage?.content || '';

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.write('Sorry, upstream unavailable. Here is a brief summary: ' + question + '\n');
    res.end();
    
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate response' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ AI API Server running on http://0.0.0.0:${PORT}`);
  console.log(`✓ Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`✓ Chat endpoint: http://0.0.0.0:${PORT}/api/chat`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  process.exit(0);
});
