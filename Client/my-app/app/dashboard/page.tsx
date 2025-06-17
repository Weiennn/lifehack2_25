"use client"

import Link from "next/link"
import {
  BarChart3,
  Brain,
  Calendar,
  FlameIcon as Fire,
  Star,
  TrendingUp,
  Upload,
  BookOpen,
  Users,
  Trophy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const mockData = {
  streak: 7,
  totalQuizzes: 24,
  averageScore: 87,
  weeklyProgress: 65,
  recentTopics: ["Mathematics", "Physics", "Chemistry"],
  motivationalQuote: "The expert in anything was once a beginner. Keep going! 🚀",
}

export default function Dashboard() {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Welcome back, Anson! 👋</h1>
          <p className="text-lg text-gray-600">Ready to continue your learning journey?</p>
        </div>

        {/* Motivational Quote */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Star className="w-6 h-6 text-yellow-300" />
              <p className="text-lg font-medium">{mockData.motivationalQuote}</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Current Streak</p>
                  <p className="text-3xl font-bold text-orange-700">{mockData.streak}</p>
                  <p className="text-xs text-orange-500">days</p>
                </div>
                <Fire className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Quizzes</p>
                  <p className="text-3xl font-bold text-blue-700">{mockData.totalQuizzes}</p>
                  <p className="text-xs text-blue-500">completed</p>
                </div>
                <Brain className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Average Score</p>
                  <p className="text-3xl font-bold text-green-700">{mockData.averageScore}%</p>
                  <p className="text-xs text-green-500">this week</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Weekly Goal</p>
                  <p className="text-3xl font-bold text-purple-700">{mockData.weeklyProgress}%</p>
                  <p className="text-xs text-purple-500">progress</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                <span>Weekly Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>This Week's Goal</span>
                    <span>{mockData.weeklyProgress}%</span>
                  </div>
                  <Progress value={mockData.weeklyProgress} className="h-3" />
                </div>
                <p className="text-sm text-gray-600">
                  Great job! You're {mockData.weeklyProgress}% towards your weekly learning goal.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.recentTopics.map((topic, index) => (
                  <div key={topic} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{topic}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-500">Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                asChild
                variant="outline"
                className="h-20 flex-col space-y-2 hover:bg-purple-50 hover:border-purple-300"
              >
                <Link href="/upload">
                  <Upload className="w-6 h-6 text-purple-500" />
                  <span>Upload PDF</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-20 flex-col space-y-2 hover:bg-blue-50 hover:border-blue-300"
              >
                <Link href="/quiz">
                  <BookOpen className="w-6 h-6 text-blue-500" />
                  <span>Take Quiz</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-20 flex-col space-y-2 hover:bg-green-50 hover:border-green-300"
              >
                <Link href="/team">
                  <Users className="w-6 h-6 text-green-500" />
                  <span>View Team</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-20 flex-col space-y-2 hover:bg-orange-50 hover:border-orange-300"
              >
                <Link href="/rankings">
                  <Trophy className="w-6 h-6 text-orange-500" />
                  <span>Rankings</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
