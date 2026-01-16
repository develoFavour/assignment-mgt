"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { useAuthStore } from "@/lib/store"
import { useUIStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, LayoutDashboard, BookOpen, Book, FileText } from "lucide-react"

const studentNavigationItems = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/courses", label: "My Courses", icon: BookOpen },
  { href: "/student/materials", label: "Course Materials", icon: Book },
  { href: "/student/assignments", label: "Assignments", icon: FileText },
]


interface CourseWithLecturer {
  _id: string
  course_code: string
  course_name: string
  level: number
  lecturer_name: string
  assignments_count: number
}

export default function CoursesPage() {
  const router = useRouter()
  const { session } = useAuthStore()
  const { sidebarOpen } = useUIStore()
  const [courses, setCourses] = useState<CourseWithLecturer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push("/login")
    } else if (session.role !== "student") {
      router.push("/")
    }
  }, [session, router])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/student/courses")
        if (res.ok) {
          setCourses(await res.json())
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err)
      } finally {
        setLoading(false)
      }
    }

    if (session?.role === "student") {
      fetchCourses()
    }
  }, [session])

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
            <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
            <p className="text-muted-foreground mt-1">Courses you are enrolled in this semester</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="text-center text-muted-foreground">Loading courses...</div>
            ) : courses.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 col-span-full">No courses enrolled</div>
            ) : (
              courses.map((course) => (
                <a key={course._id} href={`/student/courses/${course._id}`} className="group">
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="space-y-1">
                        <div className="text-sm font-mono text-primary">{course.course_code}</div>
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {course.course_name}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{course.lecturer_name}</span>
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
