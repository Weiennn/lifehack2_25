// server/src/routes/quiz.js
const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const { chunkText } = require('../utils/pdf');
const { generateQuestions } = require('../utils/gemini');
const db = require('../../db'); // Import the database connection

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

    // Store the quiz and questions in the database
    db.serialize(() => {
      db.run('INSERT INTO quizzes (created_at) VALUES (CURRENT_TIMESTAMP)', function(err) {
        if (err) {
          console.error('Error inserting quiz:', err);
          return res.status(500).json({ error: 'Failed to save quiz' });
        }

        const quizId = this.lastID;
        console.log(`Quiz inserted with ID: ${quizId}`); // Debugging log

        const stmt = db.prepare('INSERT INTO questions (quiz_id, question, options, correct_index, difficulty, explanation) VALUES (?, ?, ?, ?, ?, ?)');

        let questionsInsertedCount = 0;
        const totalQuestions = allQuestions.length;

        if (totalQuestions === 0) {
          stmt.finalize(); // Finalize if no questions to insert
          res.json({ questions: allQuestions, quizId: quizId });
          return;
        }

        allQuestions.forEach((q, index) => {
          stmt.run(quizId, q.question, JSON.stringify(q.options), q.correct, q.difficulty, q.explanation, function(err) {
            if (err) {
              console.error(`Error inserting question ${index} (Quiz ID: ${quizId}):`, err);
            } else {
              console.log(`Question ${index} inserted successfully (Quiz ID: ${quizId}).`); // Debugging log
            }
            questionsInsertedCount++;
            if (questionsInsertedCount === totalQuestions) {
              stmt.finalize();
              console.log("Sending response to client:", { questions: allQuestions, quizId: quizId }); // Added log
              res.json({ questions: allQuestions, quizId: quizId });
            }
          });
        });
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:quizId', (req, res) => {
  const { quizId } = req.params;
  db.all('SELECT question, options, correct_index, difficulty, explanation FROM questions WHERE quiz_id = ?', [quizId], (err, rows) => {
    if (err) {
      console.error('Error retrieving questions:', err);
      return res.status(500).json({ error: 'Failed to retrieve questions' });
    }
    const questions = rows.map(row => ({
      question: row.question,
      options: JSON.parse(row.options),
      correct: row.correct_index,
      difficulty: row.difficulty,
      explanation: row.explanation
    }));
    res.json({ questions });
  });
});

module.exports = router;
