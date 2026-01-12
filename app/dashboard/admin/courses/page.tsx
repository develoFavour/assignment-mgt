"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { useAuthStore } from "@/lib/store"
import { useUIStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import type { Course } from "@/lib/types"

export default function CoursesPage() {
  const router = useRouter()
  const { session } = useAuthStore()
  const { sidebarOpen } = useUIStore()
  const [courses, setCourses] = useState<Course[]>([])
  const [lecturers, setLecturers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    course_code: "",
    course_name: "",
    level: 100,
    lecturer_id: "",
    semester: "1",
  })

  useEffect(() => {
    if (!session) {
      router.push("/login")
    } else if (session.role !== "admin") {
      router.push("/")
    }
  }, [session, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, lecturersRes] = await Promise.all([
          fetch("/api/admin/courses"),
          fetch("/api/admin/lecturers"),
        ])

        if (coursesRes.ok) {
          setCourses(await coursesRes.json())
        }
        if (lecturersRes.ok) {
          setLecturers(await lecturersRes.json())
        }
      } catch (err) {
        console.error("Failed to fetch data:", err)
      } finally {
        setLoading(false)
      }
    }

    if (session?.role === "admin") {
      fetchData()
    }
  }, [session])

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        setCourses([...courses, data.course])
        setFormData({ course_code: "", course_name: "", level: 100, lecturer_id: "", semester: "1" })
        setShowAddForm(false)
      }
    } catch (err) {
      console.error("Failed to add course:", err)
    }
  }

  if (!session || session.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <main className={`transition-all duration-200 ${sidebarOpen ? "lg:ml-64" : ""}`}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Courses</h1>
              <p className="text-muted-foreground mt-1">Manage university courses and assignments</p>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Course
            </Button>
          </div>

          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Course</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCourse} className="space-y-4">
                  <Input
                    placeholder="Course Code (e.g., CSC401)"
                    value={formData.course_code}
                    onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Course Name"
                    value={formData.course_name}
                    onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                    required
                  />

                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: Number.parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-input rounded-lg"
                  >
                    <option value={100}>Level 100</option>
                    <option value={200}>Level 200</option>
                    <option value={300}>Level 300</option>
                    <option value={400}>Level 400</option>
                  </select>

                  <select
                    value={formData.lecturer_id}
                    onChange={(e) => setFormData({ ...formData, lecturer_id: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg"
                    required
                  >
                    <option value="">Select Lecturer</option>
                    {lecturers.map((lecturer) => (
                      <option key={lecturer._id} value={lecturer._id}>
                        {lecturer.first_name} {lecturer.last_name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg"
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      Add Course
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center text-muted-foreground">Loading courses...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium">Code</th>
                        <th className="text-left py-3 px-4 font-medium">Name</th>
                        <th className="text-left py-3 px-4 font-medium">Level</th>
                        <th className="text-left py-3 px-4 font-medium">Lecturer</th>
                        <th className="text-left py-3 px-4 font-medium">Semester</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course: any) => (
                        <tr key={course._id} className="border-b border-border hover:bg-muted">
                          <td className="py-3 px-4 font-mono font-medium">{course.course_code}</td>
                          <td className="py-3 px-4">{course.course_name}</td>
                          <td className="py-3 px-4">{course.level}</td>
                          <td className="py-3 px-4 text-muted-foreground">{course.lecturer_name || "N/A"}</td>
                          <td className="py-3 px-4">Sem {course.semester}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
