import { CheckCircle, Clock, AlertTriangle, User, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ReportTimeline({ report }) {
  // In a real app, this would come from the report data
  const timeline = [
    {
      id: 1,
      title: "Report Submitted",
      description: "Citizen submitted initial report",
      timestamp: "2023-06-15T09:30:00",
      icon: FileText,
      status: "complete",
    },
    {
      id: 2,
      title: "Initial Review",
      description: "Report reviewed by dispatch",
      timestamp: "2023-06-15T10:15:00",
      icon: CheckCircle,
      status: "complete",
    },
    {
      id: 3,
      title: "Officer Assigned",
      description: "Officer Johnson assigned to case",
      timestamp: "2023-06-15T11:45:00",
      icon: User,
      status: "complete",
    },
    {
      id: 4,
      title: "Investigation In Progress",
      description: "Officer conducting on-site investigation",
      timestamp: "2023-06-15T14:20:00",
      icon: Clock,
      status: "in-progress",
    },
    {
      id: 5,
      title: "Evidence Collection",
      description: "Pending evidence collection",
      timestamp: "",
      icon: AlertTriangle,
      status: "pending",
    },
  ]

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Case Timeline</h3>

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
                  <p className="text-xs text-gray-400 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

