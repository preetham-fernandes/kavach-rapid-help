import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Phone, Mail, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react"

export default function ReportDetails({ report }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Incident Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Incident Type</h4>
            <div className="flex items-center mt-1">
              <Badge variant="outline" className="mr-2">
                {report.type}
              </Badge>
              <Badge
                className={
                  report.priority === "High"
                    ? "bg-red-500"
                    : report.priority === "Medium"
                      ? "bg-amber-500"
                      : "bg-blue-500"
                }
              >
                {report.priority} Priority
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
            <div className="flex items-center mt-1">
              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm">{new Date(report.timestamp).toLocaleDateString()}</span>
              <Clock className="h-4 w-4 text-gray-500 ml-4 mr-2" />
              <span className="text-sm">{new Date(report.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Reported By</h4>
            <div className="flex items-center mt-1">
              <User className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm">{report.reportedBy}</span>
            </div>
            <div className="flex items-center mt-1">
              <Phone className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm">{report.contactInfo?.phone || "Not provided"}</span>
            </div>
            <div className="flex items-center mt-1">
              <Mail className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm">{report.contactInfo?.email || "Not provided"}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Status Information</h4>
            <div className="flex items-center mt-1">
              <AlertTriangle className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm">Status: </span>
              <Badge className="ml-2" variant={report.status === "Resolved" ? "default" : "outline"}>
                {report.status}
              </Badge>
            </div>
            <div className="flex items-center mt-1">
              <CheckCircle2 className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm">Verification: </span>
              <Badge className="ml-2" variant={report.verified ? "default" : "outline"}>
                {report.verified ? "Verified" : "Pending Verification"}
              </Badge>
            </div>
            <div className="flex items-center mt-1">
              <ShieldAlert className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm">ID Verification: </span>
              <Badge className="ml-2" variant={report.idVerified ? "default" : "outline"}>
                {report.idVerified ? "Verified" : "Not Verified"}
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Description</h4>
            <p className="text-sm mt-1">{report.description}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Assigned Officer</h4>
            <p className="text-sm mt-1">{report.assignedOfficer || "Not yet assigned"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

