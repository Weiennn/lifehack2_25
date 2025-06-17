// server/src/routes/quiz.js
const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const { chunkText } = require('../utils/pdf');
const { generateQuestions } = require('../utils/gemini');
const db = require('../../db'); // Import the database connection

// Helper function to get questions by difficulty with randomness
async function getQuestionByDifficulty(quizId, targetDifficulty, excludeQuestionIds, limit = 10) { // Increased limit to 10
  return new Promise((resolve, reject) => {
    let difficultyQuery = targetDifficulty;
    const randomChance = Math.random();

    // Implement 80/20 randomness for difficulty selection
    if (randomChance < 0.2) { // 20% chance to pick from neighboring difficulty
      const difficulties = ["Easy", "Medium", "Hard"];
      const currentIndex = difficulties.indexOf(targetDifficulty);

      if (currentIndex !== -1) {
        let neighboringDifficulties = [];
        if (currentIndex > 0) neighboringDifficulties.push(difficulties[currentIndex - 1]);
        if (currentIndex < difficulties.length - 1) neighboringDifficulties.push(difficulties[currentIndex + 1]);

        if (neighboringDifficulties.length > 0) {
          difficultyQuery = neighboringDifficulties[Math.floor(Math.random() * neighboringDifficulties.length)];
        }
      }
    }

    const excludeClause = excludeQuestionIds.length > 0 ? `AND id NOT IN (${excludeQuestionIds.join(',')})` : '';
    const sql = `SELECT id, question, options, correct_index, difficulty, explanation FROM questions WHERE quiz_id = ? AND difficulty = ? ${excludeClause} ORDER BY RANDOM() LIMIT ?`;

    db.all(sql, [quizId, difficultyQuery, limit], (err, rows) => {
      if (err) {
        console.error('Error retrieving adaptive questions:', err);
        return reject(err);
      }
      const questions = rows.map(row => ({
        id: row.id,
        question: row.question,
        options: JSON.parse(row.options),
        correct: row.correct_index,
        difficulty: row.difficulty,
        explanation: row.explanation
      }));
      resolve(questions);
    });
  });
}

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

    // Cap at 100 questions in total.
    if (allQuestions.length > 100) {
      allQuestions = allQuestions.slice(0, 100);
    }

    if (allQuestions.length === 0) {
      return res.status(500).json({ error: 'No questions generated' });
    }

    // Store the quiz and questions in the database
    db.serialize(() => {
      const quizTitle = req.file.originalname.replace(/\.pdf$/i, ''); // Use original filename as title
      db.run('INSERT INTO quizzes (created_at, title) VALUES (CURRENT_TIMESTAMP, ?)', [quizTitle], function(err) {
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

// New endpoint to start an adaptive quiz
router.post('/start-adaptive/:quizId', async (req, res) => {
  const { quizId } = req.params;
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required to start an adaptive quiz.' });
  }

  try {
    // Get or initialize user's quiz progress
    const userProgress = await new Promise((resolve, reject) => {
      db.get('SELECT confidence_score, asked_question_ids FROM user_quiz_progress WHERE username = ? AND quiz_id = ?', [username, quizId], (err, row) => {
        if (err) return reject(err);
        if (row) {
          resolve({
            confidence_score: row.confidence_score,
            asked_question_ids: JSON.parse(row.asked_question_ids || '[]')
          });
        } else {
          // Initialize new progress
          db.run('INSERT INTO user_quiz_progress (username, quiz_id, confidence_score, asked_question_ids) VALUES (?, ?, 0, \'[]\')', [username, quizId], function(err) {
            if (err) return reject(err);
            resolve({ confidence_score: 0, asked_question_ids: [] });
          });
        }
      });
    });

    const initialDifficulty = "Easy"; // Starting difficulty for score 0
    const questions = await getQuestionByDifficulty(quizId, initialDifficulty, userProgress.asked_question_ids);

    res.json({
      questions,
      confidence_score: userProgress.confidence_score,
      current_difficulty: initialDifficulty
    });

  } catch (err) {
    console.error('Error starting adaptive quiz:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/all', (req, res) => {
  db.all('SELECT id, title, created_at FROM quizzes ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error retrieving all quizzes:', err);
      return res.status(500).json({ error: 'Failed to retrieve quizzes' });
    }
    res.json({ quizzes: rows });
  });
});

// New endpoint to submit an answer and get the next adaptive question(s)
router.post('/submit-answer', async (req, res) => {
  const { username, quizId, questionId, isCorrect, questionDifficulty } = req.body;

  if (!username || !quizId || questionId === undefined || isCorrect === undefined || !questionDifficulty) {
    return res.status(400).json({ error: 'Missing required parameters for submitting answer.' });
  }

  try {
    // Get current user progress
    const userProgress = await new Promise((resolve, reject) => {
      db.get('SELECT confidence_score, asked_question_ids FROM user_quiz_progress WHERE username = ? AND quiz_id = ?', [username, quizId], (err, row) => {
        if (err) return reject(err);
        if (!row) return reject(new Error('User progress not found. Start adaptive quiz first.'));
        resolve({
          confidence_score: row.confidence_score,
          asked_question_ids: JSON.parse(row.asked_question_ids || '[]')
        });
      });
    });

    let newConfidenceScore = userProgress.confidence_score;

    // Apply score adjustment logic
    if (isCorrect) {
      if (questionDifficulty === "Easy") newConfidenceScore += 1;
      else if (questionDifficulty === "Medium") newConfidenceScore += 2;
      else if (questionDifficulty === "Hard") newConfidenceScore += 3;
    } else { // Incorrect answer
      if (questionDifficulty === "Easy") newConfidenceScore -= 2;
      else if (questionDifficulty === "Medium") newConfidenceScore -= 1;
      // If Wrong Hard, score remains unchanged (newConfidenceScore += 0)
    }

    // Bound the score between -5 and +10
    newConfidenceScore = Math.max(-5, Math.min(10, newConfidenceScore));

    // Add current question to asked_question_ids
    const newAskedQuestionIds = [...userProgress.asked_question_ids, questionId];

    // Update user progress in DB
    await new Promise((resolve, reject) => {
      db.run('UPDATE user_quiz_progress SET confidence_score = ?, asked_question_ids = ? WHERE username = ? AND quiz_id = ?',
        [newConfidenceScore, JSON.stringify(newAskedQuestionIds), username, quizId],
        function(err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    // Determine next difficulty
    let nextDifficulty;
    if (newConfidenceScore >= -5 && newConfidenceScore <= 0) {
      nextDifficulty = "Easy";
    } else if (newConfidenceScore >= 1 && newConfidenceScore <= 4) {
      nextDifficulty = "Medium";
    } else { // newConfidenceScore >= 5
      nextDifficulty = "Hard";
    }

    // Get next batch of questions
    const nextQuestions = await getQuestionByDifficulty(quizId, nextDifficulty, newAskedQuestionIds);

    res.json({
      questions: nextQuestions,
      new_confidence_score: newConfidenceScore,
      next_difficulty: nextDifficulty
    });

  } catch (err) {
    console.error('Error submitting answer or getting next question:', err);
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
