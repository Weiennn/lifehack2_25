// server/src/routes/quiz.js
const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const { chunkText } = require('../utils/pdf');
const { generateQuestions } = require('../utils/gemini');

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) =>
    /\.pdf$/i.test(file.originalname) ? cb(null, true) : cb(new Error('Only PDFs allowed'), false)
});

const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Extract text and split into chunks
    const data = await pdf(req.file.buffer);
    const chunks = chunkText(data.text, 20000);

    // Generate questions for each chunk
    const perChunkQs = [];
    for (const chunk of chunks) {
      const qs = await generateQuestions(chunk);
      perChunkQs.push(qs);
    }

    // 1) Take one question per chunk
    let allQuestions = perChunkQs
      .map(qs => qs.shift())    // remove first question from each chunk
      .filter(Boolean);

    // 2) If chunks ≤ 10, fill to exactly 10 questions
    if (allQuestions.length <= 10) {
      for (const qs of perChunkQs) {
        while (qs.length > 0 && allQuestions.length < 10) {
          allQuestions.push(qs.shift());
        }
        if (allQuestions.length >= 10) break;
      }
    }

    // 3) If chunks > 10, we now have one per chunk (so >10 questions).
    //    Cap at 20 questions in total.
    if (allQuestions.length > 20) {
      allQuestions = allQuestions.slice(0, 20);
    }

    if (allQuestions.length === 0) {
      return res.status(500).json({ error: 'No questions generated' });
    }

    res.json({ questions: allQuestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
