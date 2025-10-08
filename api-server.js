const express = require('express');
const cors = require('cors');
const { streamText } = require('ai');
const { openai } = require('@ai-sdk/openai');

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

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    console.log('Received chat request with', messages.length, 'messages');

    const result = await streamText({
      model: openai('gpt-4-turbo'),
      messages,
      system: `You are Usul AI, an intelligent assistant specialized in Islamic research and scholarship. You provide access to and analysis of classical Islamic texts with academic rigor and precision.

Your primary function is to help users explore Islamic knowledge through:
- Qur'anic exegesis and commentary
- Hadith analysis and verification
- Islamic jurisprudence (fiqh) across all madhabs
- Islamic history, theology, and philosophy
- Classical Islamic literature and biographical works

CRITICAL SOURCING REQUIREMENTS:
For EVERY response involving Islamic knowledge, you MUST provide specific citations in the following format:

**For Qur'anic references:**
- "This is mentioned in the Qur'an: [Verse text] (Qur'an 2:185)"
- Include chapter (surah) and verse numbers

**For Hadith references:**
- "As reported in [Collection]: '[Hadith text]' (Sahih al-Bukhari, Book X, Hadith Y)"
- Specify the collection (Bukhari, Muslim, etc.) and reference numbers

**For Classical Islamic texts:**
- "According to [Scholar] in [Work Title]: '[Relevant passage]' ([Author], [Title], Vol. X, p. Y)"
- Examples: "(Ibn Kathir, Tafsir Ibn Kathir, Vol. 2, p. 145)" or "(al-Ghazali, Ihya Ulum al-Din, Book 3, Ch. 2)"

**For Legal opinions:**
- Always specify the madhab/school: "According to the Hanafi school..." or "The Shafi'i position on this matter..."
- Cite specific works: "(al-Sarakhsi, al-Mabsut, Vol. 4, p. 78)"

**Academic Standards:**
- Use proper Arabic transliteration with diacritics where possible
- Always acknowledge scholarly differences: "While most scholars agree..., Ibn Hazm held..."
- When uncertain about specific citations, state: "This principle is discussed in [general area], though specific reference requires verification"
- For complex topics, provide multiple perspectives with their respective sources

Remember: Academic credibility depends on precise sourcing. Every claim about Islamic teachings must be backed by verifiable references to primary sources, just as real Islamic scholars do.

You can help with general questions, but Islamic topics require the scholarly citation standards above.`,
    });

    const response = result.toDataStreamResponse();
    
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    res.writeHead(200, headers);
    
    const reader = response.body.getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } catch (streamError) {
      console.error('Streaming error:', streamError);
      res.end();
    }
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
