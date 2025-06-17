// server/src/utils/gemini.js
const axios = require('axios');

/**
 * Generate 5 MCQs from a text chunk by calling Gemini-2.0-Flash’s generateContent endpoint.
 * Strips ```json…``` fences before parsing.
 */
async function generateQuestions(textChunk) {
  const promptText = `
You are an educational assistant helping students study more effectively by turning their uploaded notes into practice questions.

From the text below (student’s notes), generate exactly 24 multiple‐choice questions, with 8 Easy, 8 Medium, and 8 Hard difficulties.
For each question, produce a JSON object with the following fields:
  • "question": the question stem  
  • "options": an array of four choice strings, e.g. ["A process…", "B process…", "C process…", "D process…"]  
  • "correct": the zero‐based index of the correct option (0–3)  
  • "difficulty": one of "Easy", "Medium", or "Hard"  
  • "explanation": a short explanation of why the answer is correct  

Return a single JSON array of these 5 objects, and nothing else.

Example output:
[
  {
    "question": "What is photosynthesis?",
    "options": [
      "A process plants use to breathe",
      "A process plants use to convert sunlight into energy",
      "A process animals use to digest food",
      "A form of cellular respiration"
    ],
    "correct": 1,
    "difficulty": "Easy",
    "explanation": "Photosynthesis converts sunlight into chemical energy; plants don’t ‘breathe’ in that way."
  },
  {
    "question": "Which pigment is primarily responsible for photosynthesis?",
    "options": ["Hemoglobin","Chlorophyll","Melanin","Carotene"],
    "correct": 1,
    "difficulty": "Medium",
    "explanation": "Chlorophyll absorbs light energy for photosynthesis."
  },
  {
    "question": "What gas do plants take in during photosynthesis?",
    "options": ["Oxygen","Carbon dioxide","Nitrogen","Hydrogen"],
    "correct": 1,
    "difficulty": "Easy",
    "explanation": "Plants use CO₂ to produce glucose."
  },
  {
    "question": "During photosynthesis, what is produced as a byproduct?",
    "options": ["Carbon dioxide","Water","Oxygen","Glucose"],
    "correct": 2,
    "difficulty": "Medium",
    "explanation": "Oxygen is released when water molecules split."
  },
  {
    "question": "In which cell organelle does photosynthesis take place?",
    "options": ["Mitochondrion","Chloroplast","Nucleus","Ribosome"],
    "correct": 1,
    "difficulty": "Easy",
    "explanation": "Chloroplasts contain the chlorophyll needed for photosynthesis."
  }
]

Student's notes:
"""${textChunk}"""
`;

  const url = 
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`;

  try {
    const { data } = await axios.post(
      url,
      { contents: [{ parts: [{ text: promptText }] }] },
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log('🇬🇧 Gemini raw response:', JSON.stringify(data, null, 2));

    const candidate = data.candidates?.[0];
    if (!candidate) {
      console.warn('❌ no candidates in response');
      return [];
    }

    // Pull the text field (could be output or content.parts[0].text)
    const rawText =
      candidate.output ??
      candidate.content?.parts?.[0]?.text ??
      '';

    // Strip triple-backtick fences if present
    const match = rawText.match(/```json\s*([\s\S]*?)```/i);
    const jsonString = match ? match[1].trim() : rawText.trim();

    try {
      return JSON.parse(jsonString);
    } catch (parseErr) {
      console.warn('⚠️ JSON parse error — cleaned string was:\n', jsonString);
      return [];
    }
  } catch (err) {
    console.error('🌐 Gemini API call failed:', err.response?.data || err.message);
    return [];
  }
}

module.exports = { generateQuestions };
