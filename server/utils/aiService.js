const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPTS = {
  ask: `You are a friendly CS tutor on VedhaEduSpark. Answer questions clearly with examples. Use markdown formatting. Keep answers concise but thorough.`,
  codeHint: `You are a coding mentor. Give HINTS and GUIDANCE only — do NOT provide the full solution. Help the student think through the problem. Use bullet points for steps. If they share code, point out the issue without fixing it completely.`,
  explain: `You are a CS concept explainer. Explain the given concept in simple terms with real-world analogies. Use markdown with code examples where helpful. Keep it beginner-friendly.`,
};

const chat = async (mode, messages) => {
  try {
    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.ask;
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });
    return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Groq AI error:', error.message);
    throw new Error('AI service temporarily unavailable');
  }
};

module.exports = { chat };
