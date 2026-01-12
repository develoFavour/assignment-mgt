"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { useAuthStore } from "@/lib/store"
import { useUIStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, FileText } from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const { session } = useAuthStore()
  const { sidebarOpen } = useUIStore()

  useEffect(() => {
    if (!session) {
      router.push("/login")
    } else if (session.role !== "admin") {
      router.push("/")
    }
  }, [session, router])

  if (!session || session.role !== "admin") {
    return null
  }

  const stats = [
    { label: "Total Users", value: "142", icon: Users, color: "text-blue-600" },
    { label: "Courses", value: "28", icon: BookOpen, color: "text-green-600" },
    { label: "Assignments", value: "156", icon: FileText, color: "text-purple-600" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <main className={`transition-all duration-200 ${sidebarOpen ? "lg:ml-64" : ""}`}>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage users, courses, and system settings</p>
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
                  href="/admin/users"
                  className="block p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="font-medium text-sm">Manage Users</div>
                  <div className="text-xs text-muted-foreground">Add, edit, or remove users</div>
                </a>
                <a
                  href="/admin/courses"
                  className="block p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="font-medium text-sm">Manage Courses</div>
                  <div className="text-xs text-muted-foreground">Create and configure courses</div>
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">No recent activity</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
