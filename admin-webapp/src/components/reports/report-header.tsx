import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Printer, Share2 } from "lucide-react"
import Link from "next/link"

export default function ReportHeader({ report }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Link href="/" className="text-gray-500 hover:text-primary mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Report Details</h1>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{report.title}</h2>
          <div className="flex items-center mt-1">
            <span className="text-sm text-gray-500 mr-2">Report #{report.id}</span>
            <Badge
              className={
                report.status === "Resolved"
                  ? "bg-green-500"
                  : report.status === "In Progress"
                    ? "bg-amber-500"
                    : "bg-blue-500"
              }
            >
              {report.status}
            </Badge>
            <Badge className="ml-2" variant="outline">
              {report.type}
            </Badge>
          </div>
        </div>

        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button size="sm">Update Status</Button>
        </div>
      </div>
    </div>
  )
}

