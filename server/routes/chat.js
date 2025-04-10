const express = require('express');
const axios = require('axios');
const router = express.Router();

const HUGGINGFACE_API_KEY = process.env.HF_API_KEY;

const defaultContext = `
NooSphere is a decentralized AI marketplace that rewards contributors of data, models, and computing power using blockchain. 
It includes decentralized model sharing, a secure data marketplace, a token-based incentive system, model reputation scoring, and on-chain governance.
`;

const shouldIncludeContext = (messages) => {
  const fullText = messages.map(m => m.content).join(' ').toLowerCase();
  const mentionsNooSphere = fullText.includes("noosphere");
  const isFollowUp = messages.length > 1;
  return !mentionsNooSphere || isFollowUp;
};

const composePrompt = (messages) => {
  const includeContext = shouldIncludeContext(messages);

  const systemPrompt = `
You are Zephyr, the assistant for the NooSphere project.
${includeContext ? defaultContext : ''}
Always answer based on this context. If a user's question seems like a follow-up, assume it's about NooSphere.
`.trim();

  return (
    `${systemPrompt}\n` +
    messages.map(m => `${m.role}: ${m.content}`).join('\n') +
    '\nassistant:'
  );
};

router.post('/', async (req, res) => {
  console.log('📩 Incoming request to /api/chat');

  const { messages } = req.body;
  const prompt = composePrompt(messages);

  console.log('🛠️ Prompt composed:\n', prompt);

  try {
    console.log('📤 Sending request to Hugging Face...');
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
      {
        inputs: prompt,
        options: { wait_for_model: true }
      },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('✅ Hugging Face response received!');
    console.dir(response.data, { depth: null });

    const generated = response.data?.[0]?.generated_text || '';
    const reply = generated.split('assistant:')[1]?.trim() ||
      "🤖 I'm not sure how to answer that, but feel free to ask me about NooSphere or how it works!";

    console.log('💬 Parsed reply:', reply);
    res.json({ reply });

  } catch (err) {
    console.error('❌ Hugging Face API Error:', err?.response?.data || err.message);
    res.status(500).json({ reply: '❌ Error from Hugging Face API' });
  }
});

module.exports = router;
