"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { useAuthStore } from "@/lib/store"
import { useUIStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Clock, FileUp, CheckCircle, LayoutDashboard, BookOpen, Book, FileText } from "lucide-react"

const studentNavigationItems = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/courses", label: "My Courses", icon: BookOpen },
  { href: "/student/materials", label: "Course Materials", icon: Book },
  { href: "/student/assignments", label: "Assignments", icon: FileText },
]

import { FileUpload } from "@/components/file-upload"
import { toast } from "sonner"

interface AssignmentDetail {
  _id: string
  title: string
  description: string
  deadline: string
  course_code: string
  course_name: string
  lecturer_name: string
  is_late_allowed: boolean
  cutoff_days: number
  penalty_percent: number
}

interface Submission {
  _id: string
  submitted_at: string
  is_late: boolean
  hours_late: number
  file_urls: string[]
  status: string
}

interface Grade {
  score: number
  feedback?: string
  final_score: number
  penalty_applied: number
  graded_at: string
}

export default function AssignmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { session } = useAuthStore()
  const { sidebarOpen } = useUIStore()
  const assignmentId = params.id as string

  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [grade, setGrade] = useState<Grade | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!session) {
      router.push("/login")
    } else if (session.role !== "student") {
      router.push("/")
    }
  }, [session, router])

  useEffect(() => {
    const fetchAssignmentDetail = async () => {
      try {
        const res = await fetch(`/api/student/assignments/${assignmentId}`)
        if (res.ok) {
          const data = await res.json()
          setAssignment(data.assignment)
          setSubmission(data.submission || null)
          setGrade(data.grade || null)
        }
      } catch (err) {
        console.error("Failed to fetch assignment:", err)
        setError("Failed to load assignment details")
      } finally {
        setLoading(false)
      }
    }

    if (session?.role === "student" && assignmentId) {
      fetchAssignmentDetail()
    }
  }, [session, assignmentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (uploadedFiles.length === 0) {
      setError("Please select at least one file to upload")
      return
    }

    setSubmitting(true)
    try {
      // Create FormData for file upload
      const formData = new FormData()
      uploadedFiles.forEach((file) => {
        formData.append("files", file)
      })

      const res = await fetch(`/api/student/assignments/${assignmentId}/submit`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to submit assignment")
        return
      }

      const data = await res.json()
      setSubmission(data.submission)
      toast.success("Assignment submitted successfully")
      setUploadedFiles([])
    } catch (err) {
      console.error("Failed to submit:", err)
      toast.error("An error occurred while submitting. Please try again.")
      setError("An error occurred while submitting. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const isDeadlinePassed = assignment ? new Date() > new Date(assignment.deadline) : false
  const canSubmit = !submission && (!isDeadlinePassed || (assignment?.is_late_allowed && isDeadlinePassed))

  const getTimeRemaining = () => {
    if (!assignment) return null
    const now = new Date()
    const deadline = new Date(assignment.deadline)
    const msLeft = deadline.getTime() - now.getTime()
    const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24))
    const hoursLeft = Math.floor((msLeft / (1000 * 60 * 60)) % 24)

    if (msLeft < 0) return null

    return `${daysLeft}d ${hoursLeft}h remaining`
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
          {loading ? (
            <div className="text-center text-muted-foreground">Loading assignment...</div>
          ) : !assignment ? (
            <div className="text-center text-muted-foreground">Assignment not found</div>
          ) : (
            <>
              <div>
                <a href="/student/assignments" className="text-sm text-primary hover:underline">
                  Back to Assignments
                </a>
                <h1 className="text-3xl font-bold text-foreground mt-2">{assignment.title}</h1>
                <p className="text-muted-foreground mt-1">
                  {assignment.course_code} - {assignment.course_name}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{assignment.description}</p>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">Lecturer</div>
                          <div className="text-sm mt-1">{assignment.lecturer_name}</div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">Deadline</div>
                          <div className="text-sm mt-1">{new Date(assignment.deadline).toLocaleString()}</div>
                        </div>
                      </div>

                      {assignment.is_late_allowed && (
                        <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground mt-4">
                          <strong>Late Submission:</strong> Allowed up to {assignment.cutoff_days} days late with{" "}
                          {assignment.penalty_percent}% penalty per day
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {error && (
                    <div className="flex gap-3 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <p>{error}</p>
                    </div>
                  )}

                  {isDeadlinePassed && !assignment.is_late_allowed && !submission && (
                    <div className="flex gap-3 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium">Submission Closed</div>
                        <p>The deadline for this assignment has passed.</p>
                      </div>
                    </div>
                  )}

                  {isDeadlinePassed && assignment.is_late_allowed && !submission && (
                    <div className="flex gap-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 p-4 text-sm text-orange-700 dark:text-orange-400">
                      <Clock className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium">Late Submission Window</div>
                        <p>
                          You can submit up to {assignment.cutoff_days} days late with a {assignment.penalty_percent}%
                          penalty per day.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {grade && (
                    <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                          <CheckCircle className="h-5 w-5" />
                          Your Grade
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                            {grade.final_score}%
                          </div>
                          {grade.penalty_applied > 0 && (
                            <div className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                              Score: {grade.score}% - {grade.penalty_applied}% penalty = {grade.final_score}%
                            </div>
                          )}
                        </div>
                        {grade.feedback && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Feedback</div>
                            <p className="text-sm text-foreground">{grade.feedback}</p>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Graded on {new Date(grade.graded_at).toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {submission && !grade && (
                    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                          <CheckCircle className="h-5 w-5" />
                          Submitted
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-sm">
                          <div className="text-muted-foreground">Submitted on</div>
                          <div className="font-medium mt-1">{new Date(submission.submitted_at).toLocaleString()}</div>
                        </div>
                        {submission.is_late && (
                          <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                            Submitted {Math.ceil(submission.hours_late / 24)} days late
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">Awaiting grade...</div>
                        {submission.file_urls.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-blue-200">
                            <div className="text-xs font-medium text-blue-700 dark:text-blue-400">Files submitted:</div>
                            <ul className="text-xs space-y-1">
                              {submission.file_urls.map((url, idx) => (
                                <li key={idx} className="truncate text-muted-foreground">
                                  {url.split("/").pop()}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {canSubmit && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileUp className="h-5 w-5" />
                          Submit Work
                        </CardTitle>
                        {getTimeRemaining() && (
                          <p className="text-xs text-muted-foreground mt-2">{getTimeRemaining()}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <FileUpload onFilesSelected={setUploadedFiles} maxFiles={5} maxSize={50} />

                          <Button type="submit" className="w-full" disabled={submitting || uploadedFiles.length === 0}>
                            {submitting ? "Submitting..." : "Submit Assignment"}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
