import Link from "next/link"
import { mockReports } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "@/lib/utils"

export default function IncidentFeed() {
  // Sort reports by date (newest first)
  const sortedReports = [...mockReports]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8) // Show only the 8 most recent reports

  return (
    <div className="space-y-4">
      {sortedReports.map((report) => (
        <Link
          href={`/reports/${report.id}`}
          key={report.id}
          className="block p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900">{report.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{report.location.address}</p>
            </div>
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
          <div className="flex justify-between items-center mt-3">
            <Badge
              variant="outline"
              className={
                report.status === "Resolved"
                  ? "text-green-500 border-green-200"
                  : report.status === "In Progress"
                    ? "text-amber-500 border-amber-200"
                    : "text-blue-500 border-blue-200"
              }
            >
              {report.status}
            </Badge>
          </div>
        </Link>
      ))}

      <div className="text-center pt-2">
        <Link href="/reports/RPT-001" className="text-sm text-primary hover:underline">
          View all reports
        </Link>
      </div>
    </div>
  )
}

