import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LearnAI - Learn Smarter, Not Harder",
  description: "AI-powered adaptive learning platform for students",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 min-h-screen`} suppressHydrationWarning>
        <Navigation />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  )
}
