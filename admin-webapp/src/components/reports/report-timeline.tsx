"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Clock, AlertTriangle, User, FileText, FileImage } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ReportTimeline({ report }) {
  const [timeline, setTimeline] = useState([])

  useEffect(() => {
    // Generate timeline events based on the report data
    const events = []

    // Always add report submission as first event
    events.push({
      id: 1,
      title: "Complaint Submitted",
      description: report.is_anonymous ? "Anonymous user submitted complaint" : "User submitted complaint",
      timestamp: report.created_at,
      icon: FileText,
      status: "complete",
    })

    // Add evidence event if present
    if (report.evidence_url) {
      events.push({
        id: 2,
        title: "Evidence Provided",
        description: "User uploaded evidence with complaint",
        timestamp: report.created_at, // Same as report creation
        icon: FileImage,
        status: "complete",
      })

      // Add evidence review event if reviewed
      if (report.evidence_status === "reviewed") {
        events.push({
          id: 3,
          title: "Evidence Reviewed",
          description: "Administrator reviewed the evidence",
          timestamp: null, // We don't have the actual timestamp
          icon: CheckCircle,
          status: "complete",
        })
      } else {
        events.push({
          id: 3,
          title: "Evidence Review",
          description: "Pending evidence review by administrator",
          timestamp: null,
          icon: Clock,
          status: "pending",
        })
      }
    }

    // Add status events
    if (report.complaint_status === "accept") {
      events.push({
        id: 4,
        title: "Complaint Accepted",
        description: "Administrator accepted the complaint",
        timestamp: null, // We don't have the actual timestamp
        icon: CheckCircle,
        status: "complete",
      })
    } else if (report.complaint_status === "reject") {
      events.push({
        id: 4,
        title: "Complaint Rejected",
        description: "Administrator rejected the complaint",
        timestamp: null,
        icon: AlertTriangle,
        status: "complete",
      })
    } else {
      events.push({
        id: 4,
        title: "Complaint Review",
        description: "Pending complaint review by administrator",
        timestamp: null,
        icon: Clock,
        status: "pending",
      })
    }

    // Add notes event if present
    if (report.notes && report.notes.trim() !== "") {
      events.push({
        id: 5,
        title: "Administrator Notes",
        description: "Notes added to complaint record",
        timestamp: null,
        icon: FileText,
        status: "complete",
      })
    }

    setTimeline(events)
  }, [report])

  const formatDate = (dateString) => {
    if (!dateString) return "Date unavailable"
    return new Date(dateString).toLocaleString()
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Complaint Timeline</h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>

        <div className="space-y-6">
          {timeline.map((item) => (
            <div key={item.id} className="relative pl-10">
              {/* Timeline dot */}
              <div
                className={`absolute left-0 top-1 h-8 w-8 rounded-full flex items-center justify-center ${
                  item.status === "complete"
                    ? "bg-green-100"
                    : item.status === "in-progress"
                      ? "bg-amber-100"
                      : "bg-gray-100"
                }`}
              >
                <item.icon
                  className={`h-4 w-4 ${
                    item.status === "complete"
                      ? "text-green-500"
                      : item.status === "in-progress"
                        ? "text-amber-500"
                        : "text-gray-400"
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center">
                  <h4 className="text-sm font-medium">{item.title}</h4>
                  <Badge
                    className="ml-2"
                    variant={
                      item.status === "complete" ? "default" : item.status === "in-progress" ? "outline" : "secondary"
                    }
                  >
                    {item.status === "complete"
                      ? "Complete"
                      : item.status === "in-progress"
                        ? "In Progress"
                        : "Pending"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                {item.timestamp && (
                  <p className="text-xs text-gray-400 mt-1">{formatDate(item.timestamp)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}