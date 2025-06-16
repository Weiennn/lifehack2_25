"use client"

import { useState } from "react"
import { Users, UserPlus, Copy, Check, Crown, Star, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const mockTeamData = {
  teamName: "Study Squad Alpha",
  teamCode: "SQUAD2024",
  members: [
    {
      id: 1,
      name: "Alex Johnson",
      role: "Team Leader",
      avatar: "/placeholder.svg?height=40&width=40",
      streak: 12,
      totalQuizzes: 45,
      averageScore: 92,
      isLeader: true,
      status: "online",
    },
    {
      id: 2,
      name: "Sarah Chen",
      role: "Member",
      avatar: "/placeholder.svg?height=40&width=40",
      streak: 8,
      totalQuizzes: 38,
      averageScore: 87,
      isLeader: false,
      status: "online",
    },
    {
      id: 3,
      name: "Mike Rodriguez",
      role: "Member",
      avatar: "/placeholder.svg?height=40&width=40",
      streak: 15,
      totalQuizzes: 52,
      averageScore: 89,
      isLeader: false,
      status: "offline",
    },
    {
      id: 4,
      name: "Emma Wilson",
      role: "Member",
      avatar: "/placeholder.svg?height=40&width=40",
      streak: 6,
      totalQuizzes: 29,
      averageScore: 84,
      isLeader: false,
      status: "online",
    },
  ],
}

export default function TeamPage() {
  const [copied, setCopied] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")

  const handleCopyCode = () => {
    navigator.clipboard.writeText(mockTeamData.teamCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInvite = () => {
    // Mock invite functionality
    setInviteEmail("")
    // Show success message
  }

  const getStatusColor = (status: string) => {
    return status === "online" ? "bg-green-500" : "bg-gray-400"
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{mockTeamData.teamName}</h1>
          <p className="text-lg text-gray-600">Collaborate and learn together with your study team</p>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Team Members</p>
                  <p className="text-3xl font-bold text-purple-700">{mockTeamData.members.length}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Quizzes</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {mockTeamData.members.reduce((sum, member) => sum + member.totalQuizzes, 0)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Avg Team Score</p>
                  <p className="text-3xl font-bold text-green-700">
                    {Math.round(
                      mockTeamData.members.reduce((sum, member) => sum + member.averageScore, 0) /
                        mockTeamData.members.length,
                    )}
                    %
                  </p>
                </div>
                <Star className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Team Members */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <span>Team Members</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTeamData.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`}
                        ></div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{member.name}</h3>
                          {member.isLeader && <Crown className="w-4 h-4 text-yellow-500" />}
                          <Badge variant={member.status === "online" ? "default" : "secondary"} className="text-xs">
                            {member.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>

                      <div className="text-right">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-orange-600">{member.streak}</p>
                            <p className="text-gray-500">Streak</p>
                          </div>
                          <div>
                            <p className="font-medium text-blue-600">{member.totalQuizzes}</p>
                            <p className="text-gray-500">Quizzes</p>
                          </div>
                          <div>
                            <p className="font-medium text-green-600">{member.averageScore}%</p>
                            <p className="text-gray-500">Avg Score</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invite Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-purple-500" />
                  <span>Invite Members</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Team Code</label>
                  <div className="flex space-x-2">
                    <Input value={mockTeamData.teamCode} readOnly className="font-mono" />
                    <Button variant="outline" size="sm" onClick={handleCopyCode} className="px-3">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Share this code with others to join your team</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Invite by Email</label>
                  <div className="flex space-x-2">
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <Button
                      onClick={handleInvite}
                      disabled={!inviteEmail}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-yellow-800">Top Performers</p>
                      <p className="text-sm text-yellow-600">Team average above 85%</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-purple-800">Team Player</p>
                      <p className="text-sm text-purple-600">All members active this week</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
