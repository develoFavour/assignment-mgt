"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { useAuthStore } from "@/lib/store"
import { useUIStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, CheckCircle, LayoutDashboard, ClipboardCheck, BookOpen } from "lucide-react"

const lecturerNavigationItems = [
  { href: "/lecturer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lecturer/assignments", label: "Assignments", icon: FileText },
  { href: "/lecturer/grades", label: "Grades", icon: ClipboardCheck },
  { href: "/lecturer/materials", label: "Course Materials", icon: BookOpen },
]


export default function LecturerDashboard() {
  const router = useRouter()
  const { session } = useAuthStore()
  const { sidebarOpen } = useUIStore()

  useEffect(() => {
    if (!session) {
      router.push("/login")
    } else if (session.role !== "lecturer") {
      router.push("/")
    }
  }, [session, router])

  if (!session || session.role !== "lecturer") {
    return null
  }

  const stats = [
    { label: "Active Assignments", value: "12", icon: FileText, color: "text-blue-600" },
    { label: "Pending Submissions", value: "34", icon: Users, color: "text-purple-600" },
    { label: "Graded", value: "89", icon: CheckCircle, color: "text-green-600" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar navigationItems={lecturerNavigationItems} />
      <main className={`transition-all duration-200 ${sidebarOpen ? "lg:ml-64" : ""}`}>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lecturer Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your assignments and student submissions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href="/lecturer/assignments"
                  className="block p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="font-medium text-sm">Create Assignment</div>
                  <div className="text-xs text-muted-foreground">Add new assignment for your courses</div>
                </a>
                <a
                  href="/lecturer/grades"
                  className="block p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="font-medium text-sm">Grade Submissions</div>
                  <div className="text-xs text-muted-foreground">Review and grade student work</div>
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">No recent submissions</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
