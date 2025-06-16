"use client"

import { useState } from "react"
import { ChevronRight, CheckCircle, XCircle, RotateCcw, Trophy, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const mockQuestions = [
  {
    id: 1,
    question: "What is the derivative of x²?",
    options: ["2x", "x", "2", "x²"],
    correct: 0,
    difficulty: "Easy",
    explanation: "The derivative of x² is 2x using the power rule.",
  },
  {
    id: 2,
    question: "Which of the following is a fundamental theorem of calculus?",
    options: [
      "The limit of a function exists",
      "The derivative of an integral is the original function",
      "All functions are continuous",
      "Integration is always possible",
    ],
    correct: 1,
    difficulty: "Medium",
    explanation:
      "The Fundamental Theorem of Calculus states that differentiation and integration are inverse operations.",
  },
  {
    id: 3,
    question: "What is the integral of 1/x?",
    options: ["ln|x| + C", "x + C", "1/x² + C", "x² + C"],
    correct: 0,
    difficulty: "Medium",
    explanation: "The integral of 1/x is ln|x| + C, where C is the constant of integration.",
  },
]

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
  const [answers, setAnswers] = useState<number[]>([])

  const question = mockQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / mockQuestions.length) * 100

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    setShowFeedback(true)
    const newAnswers = [...answers, selectedAnswer]
    setAnswers(newAnswers)

    if (selectedAnswer === question.correct) {
      setScore(score + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      setQuizComplete(true)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setScore(0)
    setQuizComplete(false)
    setAnswers([])
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
    const percentage = Math.round((score / mockQuestions.length) * 100)

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
                You scored {score} out of {mockQuestions.length} questions correctly
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{score}</div>
                  <div className="text-sm text-green-600">Correct</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{mockQuestions.length - score}</div>
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
            <h1 className="text-2xl font-bold text-gray-900">Calculus Quiz</h1>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <span className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {mockQuestions.length}
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
              <span>Question {currentQuestion + 1}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{question.question}</h2>

            <div className="space-y-3 mb-6">
              {question.options.map((option, index) => {
                let buttonClass = "w-full p-4 text-left border-2 rounded-lg transition-all duration-200 "

                if (showFeedback) {
                  if (index === question.correct) {
                    buttonClass += "border-green-500 bg-green-50 text-green-700"
                  } else if (index === selectedAnswer && index !== question.correct) {
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
                      {showFeedback && index === question.correct && (
                        <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                      )}
                      {showFeedback && index === selectedAnswer && index !== question.correct && (
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
                <p className="text-blue-800">{question.explanation}</p>
              </div>
            )}

            <div className="flex justify-between">
              <div className="text-sm text-gray-500">
                Score: {score}/{currentQuestion + (showFeedback ? 1 : 0)}
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
                  {currentQuestion < mockQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
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
