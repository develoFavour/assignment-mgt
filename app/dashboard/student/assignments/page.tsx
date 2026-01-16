"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { useAuthStore } from "@/lib/store"
import { useUIStore } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, AlertCircle, LayoutDashboard, BookOpen, Book, FileText } from "lucide-react"

const studentNavigationItems = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/courses", label: "My Courses", icon: BookOpen },
  { href: "/student/materials", label: "Course Materials", icon: Book },
  { href: "/student/assignments", label: "Assignments", icon: FileText },
]


interface AssignmentWithStatus {
  _id: string
  title: string
  course_code: string
  course_name: string
  deadline: string
  description: string
  is_submitted: boolean
  is_graded: boolean
  grade?: number
  is_late?: boolean
  hours_late?: number
}

export default function AssignmentsPage() {
  const router = useRouter()
  const { session } = useAuthStore()
  const { sidebarOpen } = useUIStore()
  const [assignments, setAssignments] = useState<AssignmentWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "submitted" | "graded">("all")

  useEffect(() => {
    if (!session) {
      router.push("/login")
    } else if (session.role !== "student") {
      router.push("/")
    }
  }, [session, router])

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch(`/api/student/assignments?filter=${filter}`)
        if (res.ok) {
          setAssignments(await res.json())
        }
      } catch (err) {
        console.error("Failed to fetch assignments:", err)
      } finally {
        setLoading(false)
      }
    }

    if (session?.role === "student") {
      fetchAssignments()
    }
  }, [session, filter])

  const getStatusBadge = (assignment: AssignmentWithStatus) => {
    if (assignment.is_graded) {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Graded: {assignment.grade}%
        </Badge>
      )
    }
    if (assignment.is_submitted) {
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Submitted
        </Badge>
      )
    }
    return (
      <Badge variant="outline">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    )
  }

  const getDeadlineStatus = (deadline: string, isSubmitted: boolean) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const hoursLeft = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (isSubmitted) return null

    if (hoursLeft < 0) {
      return (
        <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
          <AlertCircle className="h-3 w-3" />
          Overdue
        </div>
      )
    }

    if (hoursLeft < 24) {
      return (
        <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
          <AlertCircle className="h-3 w-3" />
          {Math.ceil(hoursLeft)}h left
        </div>
      )
    }

    return (
      <div className="text-xs text-muted-foreground">
        Due {new Date(deadline).toLocaleDateString()} {new Date(deadline).toLocaleTimeString()}
      </div>
    )
  }

  if (!session || session.role !== "student") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar navigationItems={studentNavigationItems} />
      <main className={`transition-all duration-200 ${sidebarOpen ? "lg:ml-64" : ""}`}>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Assignments</h1>
            <p className="text-muted-foreground mt-1">View and submit your assignments</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {(["all", "pending", "submitted", "graded"] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status)
                  setLoading(true)
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === status ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-muted-foreground">Loading assignments...</div>
            ) : assignments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No assignments found</div>
            ) : (
              assignments.map((assignment) => (
                <a key={assignment._id} href={`/student/assignments/${assignment._id}`} className="group">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="text-sm font-mono text-primary">{assignment.course_code}</div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {assignment.title}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{assignment.description}</p>
                          <div className="mt-3">{getDeadlineStatus(assignment.deadline, assignment.is_submitted)}</div>
                        </div>
                        <div className="flex-shrink-0">{getStatusBadge(assignment)}</div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
