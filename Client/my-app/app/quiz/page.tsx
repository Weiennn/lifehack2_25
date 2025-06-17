"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation" // Import useRouter
import { ChevronRight, CheckCircle, XCircle, RotateCcw, Trophy, Brain, BookOpen } from "lucide-react" // Import BookOpen
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Question {
  question: string
  options: string[]
  correct: number
  difficulty: string
  explanation: string
  id: number // Add question ID for tracking
}

interface QuizMetadata {
  id: number
  title: string
  created_at: string
}

export default function QuizPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const quizId = searchParams.get("quizId")
  const isAdaptiveMode = searchParams.get("mode") === "adaptive"

  const [username, setUsername] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [quizzes, setQuizzes] = useState<QuizMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
  const [answers, setAnswers] = useState<number[]>([])
  const [confidenceScore, setConfidenceScore] = useState(0)
  const [currentDifficulty, setCurrentDifficulty] = useState("Easy")
  const [quizStarted, setQuizStarted] = useState(false) // To manage adaptive quiz start flow
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState(0) // New state for total questions answered

  useEffect(() => {
    const fetchQuizzesOrQuestions = async () => {
      setLoading(true)
      setError(null)
      if (quizId) {
        if (!isAdaptiveMode) {
          // Fetch specific quiz questions for normal mode
          try {
            const response = await fetch(`http://localhost:3001/generate-questions/${quizId}`)
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            setQuestions(data.questions)
            setLoading(false)
          } catch (e: any) {
            setError(e.message)
            setLoading(false)
          }
        } else {
          // In adaptive mode, wait for user to input username and click start
          setLoading(false)
        }
      } else {
        // Fetch all quizzes
        try {
          const response = await fetch(`http://localhost:3001/generate-questions/all`)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const data = await response.json()
          setQuizzes(data.quizzes)
          setLoading(false)
        } catch (e: any) {
          setError(e.message)
          setLoading(false)
        }
      }
    }

    fetchQuizzesOrQuestions()
  }, [quizId, isAdaptiveMode])

  const startAdaptiveQuiz = async () => {
    if (!username) {
      setError("Please enter a username to start the adaptive quiz.")
      return
    }
    setLoading(true)
      setError(null)
      try {
        const response = await fetch(`http://localhost:3001/generate-questions/start-adaptive/${quizId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
      setQuestions(data.questions)
      setConfidenceScore(data.confidence_score)
      setCurrentDifficulty(data.current_difficulty)
      setCurrentQuestionIndex(0) // Always start at index 0 for new batches
      setSelectedAnswer(null)
      setShowFeedback(false)
      setQuizStarted(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !quizStarted) { // Only show loading if not in adaptive mode or adaptive quiz not started
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    )
  }

  // Function to format date
  const formatQuizDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render list of quizzes if no quizId is present
  if (!quizId) {
    if (quizzes.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-lg text-gray-600">No past quizzes found. Upload a PDF to create one!</p>
        </div>
      )
    }

    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Past Quizzes</h1>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <span>Adaptive Learning Explained</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How Adaptive Learning Works:</h3>
              <p className="text-gray-700 mb-4">
                This quiz uses an adaptive learning system to tailor questions to your current understanding. Your performance on each question adjusts your "Confidence Score," which in turn determines the difficulty of the next questions you receive.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confidence Score Breakdown:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Answering an Easy question correctly increases your score by 1.</li>
                <li>Answering a Medium question correctly increases your score by 2.</li>
                <li>Answering a Hard question correctly increases your score by 3.</li>
                <li>Answering an Easy question incorrectly decreases your score by 2.</li>
                <li>Answering a Medium question incorrectly decreases your score by 1.</li>
                <li>Answering a Hard question incorrectly does not change your score.</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Your Confidence Score ranges from -5 to +10.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">Difficulty Adjustment:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Easy Questions: Confidence Score between -5 and 0.</li>
                <li>Medium Questions: Confidence Score between 1 and 4.</li>
                <li>Hard Questions: Confidence Score between 5 and 10.</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Additionally, there's a 20% chance that the system will present a question from a neighboring difficulty level to ensure a broader learning experience.
              </p>
            </CardContent>
          </Card>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-purple-500" />
                    <span>{quiz.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Created: {formatQuizDate(quiz.created_at)}</p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => router.push(`/quiz?quizId=${quiz.id}`)}
                      variant="outline"
                      className="flex-1"
                    >
                      Normal Quiz
                    </Button>
                    <Button
                      onClick={() => router.push(`/quiz?quizId=${quiz.id}&mode=adaptive`)}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      Adaptive Quiz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Conditional rendering for adaptive quiz start
  if (isAdaptiveMode && !quizStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Start Adaptive Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">Enter a username to track your progress:</p>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <Button
              onClick={startAdaptiveQuiz}
              disabled={loading || !username}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {loading ? "Starting..." : "Start Quiz"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Existing quiz display logic (when quizId is present and quiz is started)
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">No questions found for this quiz.</p>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = isAdaptiveMode ? (currentQuestionIndex + 1) / questions.length * 100 : ((currentQuestionIndex + 1) / questions.length) * 100;


  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return

    setShowFeedback(true)
    const isCorrect = selectedAnswer === currentQuestion.correct
    const newAnswers = [...answers, selectedAnswer]
    setAnswers(newAnswers)

    if (isCorrect) {
      setScore(score + 1)
    }
    setTotalQuestionsAnswered(prev => prev + 1); // Increment total questions answered

    if (isAdaptiveMode) {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`http://localhost:3001/generate-questions/submit-answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            quizId: parseInt(quizId!),
            questionId: currentQuestion.id,
            isCorrect,
            questionDifficulty: currentQuestion.difficulty,
          }),
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        // Update states with new data from backend
        setConfidenceScore(data.new_confidence_score)
        setCurrentDifficulty(data.next_difficulty)

        // If there are more questions in the current batch, just show feedback
        // Otherwise, set the new batch of questions and reset index
        if (currentQuestionIndex < questions.length - 1) {
          // Do nothing here, handleNextQuestion will move to next in batch
        } else {
          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions)
            setCurrentQuestionIndex(0) // Reset index for new batch
          } else {
            setQuizComplete(true) // No more questions
          }
        }
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleNextQuestion = () => {
    if (isAdaptiveMode) {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedAnswer(null)
        setShowFeedback(false)
      } else {
        // If at the end of a batch, and in adaptive mode, the next batch should have already been loaded by handleSubmitAnswer
        // If questions array is empty, it means quiz is complete (handled in handleSubmitAnswer)
        if (questions.length === 0) {
          setQuizComplete(true);
        } else {
          // This case should ideally not be hit if handleSubmitAnswer correctly loads the next batch
          // But as a fallback, if questions are still available, reset for next batch
          setCurrentQuestionIndex(0);
          setSelectedAnswer(null);
          setShowFeedback(false);
        }
      }
    } else {
      // Normal quiz flow
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedAnswer(null)
        setShowFeedback(false)
      } else {
        setQuizComplete(true)
      }
    }
  }

  const resetQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setScore(0)
    setQuizComplete(false)
    setAnswers([])
    setUsername("") // Reset username for adaptive mode
    setConfidenceScore(0) // Reset adaptive scores
    setCurrentDifficulty("Easy")
    setQuizStarted(false) // Reset quiz started flag
    setTotalQuestionsAnswered(0); // Reset total questions answered
    router.push('/quiz'); // Navigate back to the list of quizzes
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600 bg-green-100"
      case "Medium":
        return "text-yellow-600 bg-yellow-100"
      case "Hard":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  if (quizComplete) {
    // Use totalQuestionsAnswered for percentage calculation in adaptive mode
    const percentage = totalQuestionsAnswered > 0 ? Math.round((score / totalQuestionsAnswered) * 100) : 0;

    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center">
            <CardContent className="p-12">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Complete! 🎉</h1>

              <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                {percentage}%
              </div>

              <p className="text-xl text-gray-600 mb-8">
                You scored {score} out of {totalQuestionsAnswered} questions correctly
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{score}</div>
                  <div className="text-sm text-green-600">Correct</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{totalQuestionsAnswered - score}</div>
                  <div className="text-sm text-red-600">Incorrect</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
                  <div className="text-sm text-blue-600">Accuracy</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg mb-8">
                <h3 className="font-semibold text-gray-900 mb-2">🎯 You're improving in Calculus!</h3>
                <p className="text-gray-600">
                  Based on your performance, we recommend focusing on integration techniques next.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={resetQuiz}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Take Another Quiz
                </Button>
                <Button variant="outline">View Detailed Results</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Quiz</h1>
            {isAdaptiveMode && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Confidence: <span className="font-semibold">{confidenceScore}</span></span>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentDifficulty)}`}>
                  {currentDifficulty}
                </div>
              </div>
            )}
            {!isAdaptiveMode && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                {currentQuestion.difficulty}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
            </div>
            <span className="text-sm font-medium text-purple-600">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <span>Question {currentQuestionIndex + 1}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{currentQuestion.question}</h2>

            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => {
                let buttonClass = "w-full p-4 text-left border-2 rounded-lg transition-all duration-200 "

                if (showFeedback) {
                  if (index === currentQuestion.correct) {
                    buttonClass += "border-green-500 bg-green-50 text-green-700"
                  } else if (index === selectedAnswer && index !== currentQuestion.correct) {
                    buttonClass += "border-red-500 bg-red-50 text-red-700"
                  } else {
                    buttonClass += "border-gray-200 bg-gray-50 text-gray-500"
                  }
                } else {
                  if (selectedAnswer === index) {
                    buttonClass += "border-purple-500 bg-purple-50 text-purple-700"
                  } else {
                    buttonClass += "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={buttonClass}
                    disabled={showFeedback}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{option}</span>
                      {showFeedback && index === currentQuestion.correct && (
                        <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                      )}
                      {showFeedback && index === selectedAnswer && index !== currentQuestion.correct && (
                        <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {showFeedback && (
              <div className="p-4 bg-blue-50 rounded-lg mb-6">
                <h4 className="font-medium text-blue-900 mb-2">Explanation</h4>
                <p className="text-blue-800">{currentQuestion.explanation}</p>
              </div>
            )}

            <div className="flex justify-between">
              <div className="text-sm text-gray-500">
                Score: {score}/{currentQuestionIndex + (showFeedback ? 1 : 0)}
              </div>

              {!showFeedback ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
