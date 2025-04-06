"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, User, Phone, Mail, AlertTriangle, CheckCircle2, ShieldAlert, Save } from "lucide-react"

interface ReportDetailsProps {
  report: any
  onUpdateNotes: (notes: string) => Promise<boolean>
  updating: boolean
}

export default function ReportDetails({ report, onUpdateNotes, updating }: ReportDetailsProps) {
  const [notes, setNotes] = useState(report.notes || "")
  const [isEditing, setIsEditing] = useState(false)
  
  const handleSaveNotes = async () => {
    const success = await onUpdateNotes(notes)
    if (success) {
      setIsEditing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getUserInfo = () => {
    if (report.is_anonymous) {
      return "Anonymous Report"
    }
    return report.user_id || "User information not available"
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Complaint Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Priority Level</h4>
            <div className="flex items-center mt-1">
              <Badge
                className={
                  report.priority === "high"
                    ? "bg-red-500"
                    : report.priority === "medium"
                      ? "bg-amber-500"
                      : "bg-blue-500"
                }
              >
                {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)} Priority
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
            <div className="flex items-center mt-1">
              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm">{formatDate(report.created_at)}</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Reported By</h4>
            <div className="flex items-center mt-1">
              <User className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm">{getUserInfo()}</span>
            </div>
            {report.is_anonymous && (
              <div className="mt-1 ml-6 text-xs text-amber-600">
                User chose to remain anonymous
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Status Information</h4>
            <div className="flex items-center mt-1">
              <AlertTriangle className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm">Status: </span>
              <Badge 
                className={`ml-2 ${
                  report.complaint_status === "accept"
                    ? "bg-green-500"
                    : report.complaint_status === "reject"
                      ? "bg-red-500"
                      : "bg-amber-500"
                }`}
              >
                {report.complaint_status.charAt(0).toUpperCase() + report.complaint_status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center mt-1">
              <CheckCircle2 className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm">Evidence: </span>
              <Badge className="ml-2" variant={report.evidence_url ? "default" : "outline"}>
                {report.evidence_url ? "Provided" : "Not Provided"}
              </Badge>
            </div>
            {report.evidence_url && (
              <div className="flex items-center mt-1">
                <ShieldAlert className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm">Evidence Status: </span>
                <Badge className="ml-2" variant={report.evidence_status === "reviewed" ? "default" : "outline"}>
                  {report.evidence_status.charAt(0).toUpperCase() + report.evidence_status.slice(1)}
                </Badge>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Complaint Description</h4>
            <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 min-h-[100px]">
              {report.complaint_text}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-500">Administrative Notes</h4>
          {!isEditing ? (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              Edit Notes
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setNotes(report.notes || "")
                setIsEditing(false)
              }}
            >
              Cancel
            </Button>
          )}
        </div>
        
        {!isEditing ? (
          <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200 min-h-[100px] text-sm">
            {report.notes || "No administrative notes added yet."}
          </div>
        ) : (
          <div className="mt-2">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add administrative notes about this complaint..."
              className="min-h-[100px]"
            />
            <div className="flex justify-end mt-2">
              <Button onClick={handleSaveNotes} disabled={updating} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Notes
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}