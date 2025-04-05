"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Download, CheckCircle, User, FileText } from "lucide-react"

export default function EvidencePreview() {
  const [notes, setNotes] = useState("")

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Evidence Preview</h3>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      <Tabs defaultValue="preview">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="h-[300px] flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Select an evidence item to preview</p>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Evidence ID</h4>
                <p className="text-sm mt-1">EV-001</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Related Report</h4>
                <p className="text-sm mt-1">RPT-001</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Date Added</h4>
                <p className="text-sm mt-1">June 15, 2023 10:30 AM</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Added By</h4>
                <p className="text-sm mt-1">Officer Johnson</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Chain of Custody</h4>
              <div className="mt-2 space-y-3">
                {[
                  {
                    user: "Officer Johnson",
                    action: "Collected evidence",
                    timestamp: "June 15, 2023 10:30 AM",
                    icon: User,
                  },
                  {
                    user: "Evidence Clerk",
                    action: "Logged into system",
                    timestamp: "June 15, 2023 11:45 AM",
                    icon: FileText,
                  },
                  {
                    user: "Detective Smith",
                    action: "Reviewed evidence",
                    timestamp: "June 16, 2023 09:15 AM",
                    icon: CheckCircle,
                  },
                ].map((entry, index) => (
                  <div key={index} className="flex">
                    <div className="mr-3 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <entry.icon className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{entry.action}</p>
                      <p className="text-xs text-gray-500">
                        {entry.user} • {entry.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <div className="space-y-4">
            <Textarea
              placeholder="Add notes about this evidence item..."
              className="min-h-[150px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save Notes</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

