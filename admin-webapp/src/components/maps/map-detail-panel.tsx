"use client"

import { useState } from "react"
import { mockReports } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, User, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function MapDetailPanel() {
  // In a real app, this would be set by clicking on a map marker
  const [selectedReportId, setSelectedReportId] = useState("RPT-001")

  const report = mockReports.find((r) => r.id === selectedReportId) || null

  if (!report) {
    return <div className="p-4 text-center text-gray-500">Select a report on the map to view details</div>
  }

  return (
    <div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{report.title}</h3>
          <p className="text-sm text-gray-500">Report #{report.id}</p>
        </div>
        <Badge
          className={
            report.priority === "High" ? "bg-red-500" : report.priority === "Medium" ? "bg-amber-500" : "bg-blue-500"
          }
        >
          {report.priority}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 text-gray-500 mr-2" />
            <span>{report.location.address}</span>
          </div>
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 text-gray-500 mr-2" />
            <span>{new Date(report.timestamp).toLocaleString()}</span>
          </div>
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 text-gray-500 mr-2" />
            <span>Reported by: {report.reportedBy}</span>
          </div>
          <div className="flex items-center text-sm">
            <AlertTriangle className="h-4 w-4 text-gray-500 mr-2" />
            <span>Status: {report.status}</span>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-700 mb-4">{report.description}</p>
          <div className="flex space-x-2">
            <Button asChild variant="default">
              <Link href={`/reports/${report.id}`}>View Full Report</Link>
            </Button>
            <Button variant="outline">Assign Officer</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

