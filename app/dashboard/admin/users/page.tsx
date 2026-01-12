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
import { Plus, Upload, Trash2 } from "lucide-react"
import { FormError } from "@/components/form-error"
import { LoadingSpinner } from "@/components/loading-spinner"
import { EmptyState } from "@/components/empty-state"
import type { User } from "@/lib/types"

export default function UsersPage() {
  const router = useRouter()
  const { session } = useAuthStore()
  const { sidebarOpen } = useUIStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formError, setFormError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    role: "student" as const,
    first_name: "",
    last_name: "",
    matric_number: "",
    level: 100,
  })

  useEffect(() => {
    if (!session) {
      router.push("/login")
    } else if (session.role !== "admin") {
      router.push("/")
    }
  }, [session, router])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users")
        const data = await res.json()
        if (res.ok) {
          setUsers(data.users || [])
        } else {
          setFormError(data.error || "Failed to load users")
        }
      } catch (err) {
        console.error("[v0] Failed to fetch users:", err)
        setFormError("Failed to load users. Please refresh the page.")
      } finally {
        setLoading(false)
      }
    }

    if (session?.role === "admin") {
      fetchUsers()
    }
  }, [session])

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        setUsers([...users, data.user])
        setFormData({ email: "", role: "student", first_name: "", last_name: "", matric_number: "", level: 100 })
        setShowAddForm(false)
      } else {
        const data = await res.json()
        setFormError(data.error || "Failed to add user")
      }
    } catch (err) {
      console.error("[v0] Failed to add user:", err)
      setFormError("An error occurred while adding the user")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
      if (res.ok) {
        setUsers(users.filter((u) => u._id !== userId))
      } else {
        setFormError("Failed to delete user")
      }
    } catch (err) {
      console.error("[v0] Failed to delete user:", err)
      setFormError("Failed to delete user")
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
              <h1 className="text-3xl font-bold text-foreground">Users</h1>
              <p className="text-muted-foreground mt-1">Manage lecturers and students</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 bg-transparent">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Import CSV</span>
              </Button>
              <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add User</span>
              </Button>
            </div>
          </div>

          {formError && <FormError message={formError} />}

          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New User</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="First Name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Last Name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      required
                    />
                  </div>
                  <Input
                    placeholder="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Matric/Lecturer Number"
                    value={formData.matric_number}
                    onChange={(e) => setFormData({ ...formData, matric_number: e.target.value })}
                    required
                  />

                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as "student" | "lecturer" | "admin" })
                    }
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                  >
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="admin">Admin</option>
                  </select>

                  {formData.role === "student" && (
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: Number.parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    >
                      <option value={100}>Level 100</option>
                      <option value={200}>Level 200</option>
                      <option value={300}>Level 300</option>
                      <option value={400}>Level 400</option>
                    </select>
                  )}

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      Add User
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
                <div className="flex justify-center py-12">
                  <LoadingSpinner text="Loading users..." />
                </div>
              ) : users.length === 0 ? (
                <EmptyState
                  title="No users yet"
                  description="Start by adding lecturers and students to the system."
                  action={{ label: "Add User", onClick: () => setShowAddForm(true) }}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium">Name</th>
                        <th className="text-left py-3 px-4 font-medium">Email</th>
                        <th className="text-left py-3 px-4 font-medium">Matric</th>
                        <th className="text-left py-3 px-4 font-medium">Role</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-right py-3 px-4 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b border-border hover:bg-muted">
                          <td className="py-3 px-4">
                            {user.first_name} {user.last_name}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-xs">{user.email}</td>
                          <td className="py-3 px-4 font-mono text-xs">{user.matric_number || user.lecturer_number}</td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${user.isPasswordSet ? "bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400"}`}
                            >
                              {user.isPasswordSet ? "Active" : "Pending"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => user._id && handleDeleteUser(user._id)}
                              className="p-2 hover:bg-destructive/10 rounded transition-colors"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </td>
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
