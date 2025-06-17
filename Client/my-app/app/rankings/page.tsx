"use client"

import { useState } from "react"
import { Trophy, Medal, Star, TrendingUp, Calendar, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockClassData } from "../team/page" // Import mockClassData

interface ClassMember {
  id: number;
  name: string;
  role: string;
  avatar: string;
  streak: number;
  totalQuizzes: number;
  averageScore: number;
  isLeader: boolean;
  status: string;
}

interface RankingMember {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  quizzes: number;
  accuracy: number;
  streak: number;
  badge: string;
}

// Function to generate consistent ranking data from mockClassData
const generateRankingsData = () => {
  const membersWithScores: (ClassMember & { score: number; quizzes: number; accuracy: number; badge: string })[] = mockClassData.members.map((member: ClassMember) => ({
    ...member,
    score: member.totalQuizzes * member.averageScore * 10, // Example scoring logic
    quizzes: member.totalQuizzes,
    accuracy: member.averageScore,
    badge: "", // Will be assigned based on rank
  }))

  // Sort members by score in descending order
  const sortedMembers = membersWithScores.sort((a: { score: number }, b: { score: number }) => b.score - a.score)

  // Assign ranks and badges
  const weeklyRankings: RankingMember[] = sortedMembers.map((member: ClassMember & { score: number; quizzes: number; accuracy: number; badge: string }, index: number) => {
    let badge = "⭐"
    if (index === 0) badge = "🏆"
    else if (index === 1) badge = "🥈"
    else if (index === 2) badge = "🥉"

    return {
      rank: index + 1,
      name: member.name,
      avatar: member.avatar,
      score: member.score,
      quizzes: member.quizzes,
      accuracy: member.accuracy,
      streak: member.streak,
      badge: badge,
    }
  })

  // For monthly, let's just use the same data for simplicity or create a slightly different mock
  // For now, we'll use the same sorted data for both weekly and monthly for consistency with the team members.
  const monthlyRankings: RankingMember[] = [...weeklyRankings];

  return {
    weekly: weeklyRankings,
    monthly: monthlyRankings,
  }
}

const mockRankingsData = generateRankingsData()

export default function RankingsPage() {
  const [activeTab, setActiveTab] = useState("weekly")
  const currentData: RankingMember[] = activeTab === "weekly" ? mockRankingsData.weekly : mockRankingsData.monthly

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-400 to-yellow-600"
      case 2:
        return "from-gray-300 to-gray-500"
      case 3:
        return "from-amber-600 to-amber-800"
      default:
        return "from-purple-400 to-purple-600"
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-white" />
      case 2:
        return <Medal className="w-5 h-5 text-white" />
      case 3:
        return <Medal className="w-5 h-5 text-white" />
      default:
        return <Star className="w-5 h-5 text-white" />
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Leaderboard 🏆</h1>
          <p className="text-lg text-gray-600">See how you stack up against your classmates and friends</p>
        </div>

        {/* Top 3 Podium */}
        <Card className="mb-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
          <CardContent className="p-8">
            <div className="flex justify-center items-end space-x-8">
              {/* 2nd Place */}
              {currentData[1] && (
                <div className="text-center">
                  <div className="relative mb-4">
                    <div className="w-20 h-16 bg-gradient-to-r from-gray-300 to-gray-500 rounded-t-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">2</span>
                    </div>
                    <Avatar className="w-16 h-16 mx-auto -mt-8 border-4 border-white">
                      <AvatarImage src={currentData[1].avatar || "/placeholder.svg"} alt={currentData[1].name} />
                      <AvatarFallback>
                        {currentData[1].name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <h3 className="font-semibold text-gray-900">{currentData[1].name}</h3>
                  <p className="text-2xl font-bold text-gray-600">{currentData[1].score.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{currentData[1].accuracy}% accuracy</p>
                </div>
              )}

              {/* 1st Place */}
              {currentData[0] && (
                <div className="text-center">
                  <div className="relative mb-4">
                    <div className="w-24 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-t-lg flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <Avatar className="w-20 h-20 mx-auto -mt-10 border-4 border-white">
                      <AvatarImage src={currentData[0].avatar || "/placeholder.svg"} alt={currentData[0].name} />
                      <AvatarFallback>
                        {currentData[0].name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2 text-2xl">👑</div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{currentData[0].name}</h3>
                  <p className="text-3xl font-bold text-yellow-600">{currentData[0].score.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{currentData[0].accuracy}% accuracy</p>
                </div>
              )}

              {/* 3rd Place */}
              {currentData[2] && (
                <div className="text-center">
                  <div className="relative mb-4">
                    <div className="w-20 h-12 bg-gradient-to-r from-amber-600 to-amber-800 rounded-t-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">3</span>
                    </div>
                    <Avatar className="w-16 h-16 mx-auto -mt-8 border-4 border-white">
                      <AvatarImage src={currentData[2].avatar || "/placeholder.svg"} alt={currentData[2].name} />
                      <AvatarFallback>
                        {currentData[2].name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <h3 className="font-semibold text-gray-900">{currentData[2].name}</h3>
                  <p className="text-2xl font-bold text-gray-600">{currentData[2].score.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{currentData[2].accuracy}% accuracy</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs and Full Rankings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <span>Full Rankings</span>
              </CardTitle>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="weekly" className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Weekly</span>
                  </TabsTrigger>
                  <TabsTrigger value="monthly" className="flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span>Monthly</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentData.map((student: RankingMember, index: number) => (
                <div
                  key={student.rank}
                  className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-200 ${
                    student.rank <= 3
                      ? "bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {/* Rank */}
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-r ${getRankColor(student.rank)} flex items-center justify-center font-bold text-white`}
                  >
                    {student.rank <= 3 ? getRankIcon(student.rank) : student.rank}
                  </div>

                  {/* Avatar and Name */}
                  <div className="flex items-center space-x-3 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                      <AvatarFallback>
                        {student.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <span>{student.name}</span>
                        {student.rank <= 3 && <span className="text-lg">{student.badge}</span>}
                      </h3>
                      <p className="text-sm text-gray-600">{student.quizzes} quizzes completed</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-purple-600">{student.score.toLocaleString()}</p>
                      <p className="text-gray-500">Score</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-green-600">{student.accuracy}%</p>
                      <p className="text-gray-500">Accuracy</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-orange-600">{student.streak}</p>
                      <p className="text-gray-500">Streak</p>
                    </div>
                  </div>

                  {/* Mobile Stats */}
                  <div className="md:hidden text-right">
                    <p className="font-bold text-purple-600">{student.score.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{student.accuracy}% accuracy</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Your Performance Card */}
        <Card className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Your Current Position</h3>
                <p className="text-purple-100">You're currently ranked #2 this week! Keep it up! 🚀</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">#2</div>
                <div className="text-sm text-purple-100">This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
