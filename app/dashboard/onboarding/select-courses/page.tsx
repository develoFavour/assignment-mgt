"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Loader } from "lucide-react"

interface Course {
  _id: string
  course_code: string
  course_name: string
  level: number
}

export default function SelectCoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [studentLevel, setStudentLevel] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/onboarding/courses")
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Failed to load courses")
          return
        }

        setCourses(data.courses || [])
        setStudentLevel(data.studentLevel)
      } catch (err) {
        setError("An error occurred while loading courses")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const toggleCourse = (courseId: string) => {
    setSelectedCourses((prev) => (prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]))
  }

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (selectedCourses.length === 0) {
      setError("You must select at least one course")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/onboarding/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseIds: selectedCourses }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to enroll in courses")
        return
      }

      router.push("/dashboard")
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AuthLayout>
        <div className="flex justify-center">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthLayout>
    )
  }

  const availableCourses = studentLevel ? courses.filter((c) => c.level <= studentLevel) : courses

  return (
    <AuthLayout>
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Select Your Courses</CardTitle>
          <CardDescription>
            Choose the courses you are enrolled in. You can contact admin to modify this later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEnroll} className="space-y-4">
            {error && (
              <div className="flex gap-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto border border-border rounded-lg p-4">
              {availableCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No courses available for your level</p>
              ) : (
                availableCourses.map((course) => (
                  <div
                    key={course._id}
                    className="flex items-start gap-3 p-3 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Checkbox
                      id={course._id}
                      checked={selectedCourses.includes(course._id)}
                      onCheckedChange={() => toggleCourse(course._id)}
                      className="mt-1"
                    />
                    <label htmlFor={course._id} className="flex-1 cursor-pointer">
                      <div className="font-medium text-sm">{course.course_code}</div>
                      <div className="text-xs text-muted-foreground">{course.course_name}</div>
                    </label>
                  </div>
                ))
              )}
            </div>

            <Button type="submit" className="w-full" disabled={submitting || availableCourses.length === 0}>
              {submitting
                ? "Enrolling..."
                : `Enroll in ${selectedCourses.length} Course${selectedCourses.length !== 1 ? "s" : ""}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
