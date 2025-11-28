'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Feedback {
  id: string
  user_name: string
  comment?: string
  rating?: string // emoji: 😞 😕 😐 😊 🤩
  created_at: string
}

const emojiLabels: Record<string, string> = {
  "😞": "Poor",
  "😕": "Fair",
  "😐": "Good",
  "😊": "Very Good",
  "🤩": "Excellent",
}

export function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const supabase = createClient()

  // Fetch feedback from database
  useEffect(() => {
    const fetchFeedback = async () => {
      const { data, error } = await supabase
        .from("feedback")
        .select(`*, users(user_name)`)
        .order("created_at", { ascending: false })

      if (error) console.error(error)
      else {
        // If your feedback table has a user_id, join with users table to get user_name
        const formatted = data.map((f: any) => ({
          ...f,
          user_name: f.users?.user_name || "Anonymous"
        }))
        setFeedbacks(formatted)
        setFilteredFeedbacks(formatted)
      }
      setLoading(false)
    }

    fetchFeedback()
  }, [])

  // Filter feedback by search and emoji
  useEffect(() => {
    let filtered = feedbacks

    if (search) {
      filtered = filtered.filter(f =>
        f.user_name.toLowerCase().includes(search.toLowerCase()) ||
        (f.comment?.toLowerCase().includes(search.toLowerCase()) ?? false)
      )
    }

    if (ratingFilter !== "all") {
      filtered = filtered.filter(f => f.rating === ratingFilter)
    }

    setFilteredFeedbacks(filtered)
  }, [search, ratingFilter, feedbacks])

  if (loading) return <p>Loading feedback...</p>

  return (
    <div className="space-y-4">
      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
        <Input
          placeholder="Search by user or comment"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by mood" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="😞">😞 Poor</SelectItem>
            <SelectItem value="😕">😕 Fair</SelectItem>
            <SelectItem value="😐">😐 Good</SelectItem>
            <SelectItem value="😊">😊 Very Good</SelectItem>
            <SelectItem value="🤩">🤩 Excellent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feedback List */}
      <div className="grid gap-4">
        {filteredFeedbacks.length === 0 && <p>No feedback found.</p>}
        {filteredFeedbacks.map(fb => (
          <Card key={fb.id} className="p-4 flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <p><strong>User:</strong> {fb.user_name}</p>
              <p><strong>Mood:</strong> {fb.rating} {emojiLabels[fb.rating || ""]}</p>
              {fb.comment && <p><strong>Comment:</strong> {fb.comment}</p>}
              <p className="text-sm text-gray-500">{new Date(fb.created_at).toLocaleString()}</p>
            </div>
            <Button
              className="mt-2 md:mt-0"
              variant="destructive"
              onClick={async () => {
                await supabase.from("feedback").delete().eq("id", fb.id)
                setFeedbacks(prev => prev.filter(f => f.id !== fb.id))
              }}
            >
              Delete
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
