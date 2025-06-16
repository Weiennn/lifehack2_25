const express = require('express');
require('dotenv').config();
require('../db');

const quizRouter = require('./routes/quiz');

const app = express();
app.use(express.json());
app.use('/generate-questions', quizRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
