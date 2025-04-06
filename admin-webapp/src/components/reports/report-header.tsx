"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Printer, Share2, AlertCircle } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ReportHeaderProps {
  report: any
  onUpdateStatus: (status: string) => Promise<boolean>
  onUpdatePriority: (priority: string) => Promise<boolean>
  updating: boolean
}

export default function ReportHeader({ report, onUpdateStatus, onUpdatePriority, updating }: ReportHeaderProps) {
  const [localStatus, setLocalStatus] = useState(report.complaint_status)
  const [localPriority, setLocalPriority] = useState(report.priority)

  const handleStatusChange = async (status: string) => {
    if (status === localStatus) return

    const success = await onUpdateStatus(status)
    if (success) {
      setLocalStatus(status)
    }
  }

  const handlePriorityChange = async (priority: string) => {
    if (priority === localPriority) return

    const success = await onUpdatePriority(priority)
    if (success) {
      setLocalPriority(priority)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "accept":
        return "bg-green-500"
      case "reject":
        return "bg-red-500"
      default:
        return "bg-amber-500"
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-amber-500"
      default:
        return "bg-blue-500"
    }
  }

  // Get a truncated description to use as the title
  const getReportTitle = () => {
    if (!report.complaint_text) return "Complaint Report"
    return report.complaint_text.length > 50 
      ? report.complaint_text.substring(0, 50) + "..." 
      : report.complaint_text
  }

  const getReportId = () => {
    return report.complaint_id.substring(0, 8) + "..."
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Link href="/reports" className="text-gray-500 hover:text-primary mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Complaint Details</h1>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{getReportTitle()}</h2>
          <div className="flex items-center mt-1">
            <span className="text-sm text-gray-500 mr-2">ID: {getReportId()}</span>
            <Badge
              className={getStatusBadgeColor(localStatus)}
            >
              {localStatus.charAt(0).toUpperCase() + localStatus.slice(1)}
            </Badge>
            <Badge className="ml-2" variant="outline">
              {report.is_anonymous ? "Anonymous" : "Identified"}
            </Badge>
            {report.is_anonymous && (
              <div className="ml-2 text-amber-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span className="text-xs">Anonymous Report</span>
              </div>
            )}
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" disabled={updating}>
                Update Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem 
                onClick={() => handleStatusChange("pending")}
                className={localStatus === "pending" ? "bg-muted" : ""}
              >
                <Badge className="bg-amber-500 mr-2">Pending</Badge>
                Mark as Pending
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleStatusChange("accept")}
                className={localStatus === "accept" ? "bg-muted" : ""}
              >
                <Badge className="bg-green-500 mr-2">Accept</Badge>
                Accept Complaint
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleStatusChange("reject")}
                className={localStatus === "reject" ? "bg-muted" : ""}
              >
                <Badge className="bg-red-500 mr-2">Reject</Badge>
                Reject Complaint
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className={getPriorityBadgeColor(localPriority) + " text-white border-none"}
                disabled={updating}
              >
                Priority: {localPriority.charAt(0).toUpperCase() + localPriority.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem 
                onClick={() => handlePriorityChange("high")}
                className={localPriority === "high" ? "bg-muted" : ""}
              >
                <Badge className="bg-red-500 mr-2">High</Badge>
                High Priority
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handlePriorityChange("medium")}
                className={localPriority === "medium" ? "bg-muted" : ""}
              >
                <Badge className="bg-amber-500 mr-2">Medium</Badge>
                Medium Priority
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handlePriorityChange("low")}
                className={localPriority === "low" ? "bg-muted" : ""}
              >
                <Badge className="bg-blue-500 mr-2">Low</Badge>
                Low Priority
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}