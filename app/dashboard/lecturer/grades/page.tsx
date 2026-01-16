"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { useAuthStore } from "@/lib/store"
import { useUIStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, ClipboardCheck, BookOpen } from "lucide-react"

const lecturerNavigationItems = [
  { href: "/lecturer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lecturer/assignments", label: "Assignments", icon: FileText },
  { href: "/lecturer/grades", label: "Grades", icon: ClipboardCheck },
  { href: "/lecturer/materials", label: "Course Materials", icon: BookOpen },
]


export default function GradesPage() {
  const router = useRouter()
  const { session } = useAuthStore()
  const { sidebarOpen } = useUIStore()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null)
  const [gradeData, setGradeData] = useState({ score: "", feedback: "" })
  const [filter, setFilter] = useState("pending")

  useEffect(() => {
    if (!session) {
      router.push("/login")
    } else if (session.role !== "lecturer") {
      router.push("/")
    }
  }, [session, router])

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (session?.role !== "lecturer") return
      try {
        const res = await fetch(`/api/lecturer/submissions?status=${filter}`)
        if (res.ok) {
          setSubmissions(await res.json())
        }
      } catch (err) {
        console.error("Failed to fetch submissions:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [session, filter])

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubmission) return

    try {
      const res = await fetch(`/api/lecturer/submissions/${selectedSubmission._id}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: Number.parseInt(gradeData.score),
          feedback: gradeData.feedback,
        }),
      })

      if (res.ok) {
        setSubmissions(submissions.filter((s) => s._id !== selectedSubmission._id))
        setSelectedSubmission(null)
        setGradeData({ score: "", feedback: "" })
      }
    } catch (err) {
      console.error("Failed to grade submission:", err)
    }
  }

  if (!session || session.role !== "lecturer") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar navigationItems={lecturerNavigationItems} />
      <main className={`transition-all duration-200 ${sidebarOpen ? "lg:ml-64" : ""}`}>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Grade Submissions</h1>
            <p className="text-muted-foreground mt-1">Review and grade student submissions</p>
          </div>

          <div className="flex gap-2">
            {["pending", "graded"].map((status) => (
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center text-muted-foreground">Loading submissions...</div>
                  ) : submissions.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">No submissions found</div>
                  ) : (
                    <div className="space-y-3">
                      {submissions.map((submission) => (
                        <button
                          key={submission._id}
                          onClick={() => setSelectedSubmission(submission)}
                          className={`w-full p-4 border rounded-lg text-left hover:bg-muted transition-colors ${selectedSubmission?._id === submission._id ? "border-primary bg-primary/5" : "border-border"
                            }`}
                        >
                          <div className="font-medium text-foreground">{submission.student_name}</div>
                          <div className="text-sm text-muted-foreground">{submission.assignment_title}</div>
                          <div className="text-xs text-muted-foreground mt-2">
                            Submitted: {new Date(submission.submitted_at).toLocaleString()}
                          </div>
                          {submission.is_late && (
                            <div className="text-xs text-orange-600 mt-1">
                              Late submission ({submission.hours_late}h)
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {selectedSubmission && (
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Grade Submission</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleGrade} className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-foreground mb-2">Student</div>
                        <div className="text-sm text-muted-foreground">{selectedSubmission.student_name}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-foreground mb-2">Assignment</div>
                        <div className="text-sm text-muted-foreground">{selectedSubmission.assignment_title}</div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Score (0-100)</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={gradeData.score}
                          onChange={(e) => setGradeData({ ...gradeData, score: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Feedback</label>
                        <textarea
                          value={gradeData.feedback}
                          onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                          className="w-full px-3 py-2 border border-input rounded-lg min-h-24 resize-none text-sm"
                          placeholder="Optional feedback for student"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">
                          Submit Grade
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setSelectedSubmission(null)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
