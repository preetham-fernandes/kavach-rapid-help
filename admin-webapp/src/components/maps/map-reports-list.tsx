"use client"

import { useState } from "react"
import { mockReports } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "@/lib/utils"

export default function MapReportsList() {
  const [selectedReport, setSelectedReport] = useState(null)

  // Sort reports by date (newest first)
  const sortedReports = [...mockReports].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-3">Recent Reports</h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {sortedReports.map((report) => (
          <div
            key={report.id}
            className={`p-3 border rounded-md cursor-pointer transition-colors ${
              selectedReport === report.id ? "border-primary bg-primary/5" : "border-gray-200 hover:bg-gray-50"
            }`}
            onClick={() => setSelectedReport(report.id)}
          >
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-medium">{report.title}</h4>
              <Badge
                className={
                  report.priority === "High"
                    ? "bg-red-500"
                    : report.priority === "Medium"
                      ? "bg-amber-500"
                      : "bg-blue-500"
                }
              >
                {report.priority}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">{report.location.address}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

