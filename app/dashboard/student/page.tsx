"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { useAuthStore } from "@/lib/store"
import { useUIStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle } from "lucide-react"

export default function StudentDashboard() {
  const router = useRouter()
  const { session } = useAuthStore()
  const { sidebarOpen } = useUIStore()
  const [stats, setStats] = useState({ active: 0, submitted: 0, graded: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push("/login")
    } else if (session.role !== "student") {
      router.push("/")
    }
  }, [session, router])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/student/stats")
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err)
      } finally {
        setLoading(false)
      }
    }

    if (session?.role === "student") {
      fetchStats()
    }
  }, [session])

  if (!session || session.role !== "student") {
    return null
  }

  const statCards = [
    { label: "Active Assignments", value: stats.active, icon: FileText, color: "text-blue-600" },
    { label: "Submitted", value: stats.submitted, icon: Clock, color: "text-purple-600" },
    { label: "Graded", value: stats.graded, icon: CheckCircle, color: "text-green-600" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <main className={`transition-all duration-200 ${sidebarOpen ? "lg:ml-64" : ""}`}>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track your assignments and submissions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loading ? "-" : stat.value}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href="/student/courses"
                  className="block p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="font-medium text-sm">View My Courses</div>
                  <div className="text-xs text-muted-foreground">See all enrolled courses</div>
                </a>
                <a
                  href="/student/assignments"
                  className="block p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="font-medium text-sm">My Assignments</div>
                  <div className="text-xs text-muted-foreground">View and submit assignments</div>
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">No upcoming assignments</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
