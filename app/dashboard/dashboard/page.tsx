"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"

export default function DashboardPage() {
  const router = useRouter()
  const { session } = useAuthStore()

  useEffect(() => {
    if (!session) {
      router.push("/login")
    } else {
      // Redirect to role-specific dashboard
      router.push(`/${session.role}`)
    }
  }, [session, router])

  return null
}
