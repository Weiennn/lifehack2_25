"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function UploadPage() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const pdfFile = files.find((file) => file.type === "application/pdf")

    if (pdfFile) {
      handleFileUpload(pdfFile)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      handleFileUpload(file)
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file)
    setIsProcessing(true)
    setProcessingProgress(0)

    // Simulate processing with progress
    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsProcessing(false)
          setAnalysisResult({
            topics: ["Calculus Fundamentals", "Derivatives", "Integration", "Limits"],
            chapters: 8,
            estimatedQuizTime: "15-20 minutes",
            difficulty: "Intermediate",
          })
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setIsProcessing(false)
    setProcessingProgress(0)
    setAnalysisResult(null)
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Upload Your Study Material</h1>
          <p className="text-lg text-gray-600">Upload a PDF and let our AI create personalized quizzes for you</p>
        </div>

        {!uploadedFile && (
          <Card className="mb-8">
            <CardContent className="p-8">
              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
                  isDragOver
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-300 hover:border-purple-300 hover:bg-purple-50/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">Drop your PDF here, or click to browse</h3>
                <p className="text-gray-600 mb-6">Supports PDF files up to 10MB</p>

                <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" id="file-upload" />
                <Button
                  asChild
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Choose File
                  </label>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {uploadedFile && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-500" />
                <span>Processing Document</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                {!isProcessing && !analysisResult && (
                  <Button variant="outline" size="sm" onClick={resetUpload}>
                    Remove
                  </Button>
                )}
              </div>

              {isProcessing && (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Analyzing document...</span>
                    <span>{Math.round(processingProgress)}%</span>
                  </div>
                  <Progress value={processingProgress} className="h-2" />
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span>Extracting topics and generating quiz questions</span>
                  </div>
                </div>
              )}

              {analysisResult && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-green-600 mb-4">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Analysis Complete!</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Topics Detected</h4>
                      <div className="space-y-1">
                        {analysisResult.topics.map((topic: string, index: number) => (
                          <div key={index} className="text-sm text-purple-700">
                            • {topic}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Chapters Found:</span>
                        <span className="text-sm font-medium">{analysisResult.chapters}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Estimated Quiz Time:</span>
                        <span className="text-sm font-medium">{analysisResult.estimatedQuizTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Difficulty Level:</span>
                        <span className="text-sm font-medium">{analysisResult.difficulty}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      Start Quiz
                    </Button>
                    <Button variant="outline" onClick={resetUpload}>
                      Upload Another
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tips Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              <span>Tips for Better Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">✅ Best Practices</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use clear, well-formatted PDFs</li>
                  <li>• Include textbooks or study guides</li>
                  <li>• Ensure text is readable (not scanned images)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">⚠️ Avoid</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Heavily image-based documents</li>
                  <li>• Password-protected files</li>
                  <li>• Files larger than 10MB</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
