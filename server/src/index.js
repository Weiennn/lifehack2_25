const express = require('express');
const cors = require('cors'); // Import cors
require('dotenv').config();
require('../db');

const quizRouter = require('./routes/quiz');

const app = express();
app.use(express.json());
app.use(cors()); // Use cors middleware
app.use('/generate-questions', quizRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
