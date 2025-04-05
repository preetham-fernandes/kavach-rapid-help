"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { mockSosCalls } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, PhoneCall } from "lucide-react"

interface SosCallsProps {
  selectedCallId: string | null
  onSelectCall: (id: string) => void
}

export default function SosCalls({ selectedCallId, onSelectCall }: SosCallsProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter and sort SOS calls
  const filteredCalls = mockSosCalls
    .filter(
      (call) =>
        call.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.receivedBy.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      // Sort by status first (Active > Responding > Resolved)
      const statusOrder = { Active: 0, Responding: 1, Resolved: 2 }
      const statusDiff = statusOrder[a.status] - statusOrder[b.status]

      if (statusDiff !== 0) return statusDiff

      // Then sort by timestamp (newest first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search SOS calls..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
        <AnimatePresence>
          {filteredCalls.map((call) => (
            <motion.div
              key={call.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className={`p-3 border rounded-md cursor-pointer transition-colors ${
                selectedCallId === call.id ? "border-primary bg-primary/5" : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => onSelectCall(call.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                      call.status === "Active"
                        ? "bg-red-100 text-red-500"
                        : call.status === "Responding"
                          ? "bg-amber-100 text-amber-500"
                          : "bg-green-100 text-green-500"
                    }`}
                  >
                    <PhoneCall className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{call.location}</h4>
                    <p className="text-xs text-gray-500 mt-1">{new Date(call.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <Badge
                  className={
                    call.status === "Active"
                      ? "bg-red-500"
                      : call.status === "Responding"
                        ? "bg-amber-500"
                        : "bg-green-500"
                  }
                >
                  {call.status}
                </Badge>
              </div>

              <div className="mt-2 pl-11">
                <p className="text-xs text-gray-700">
                  <span className="font-medium">Received by:</span> {call.receivedBy}
                </p>
                {call.respondingOfficer && (
                  <p className="text-xs text-gray-700">
                    <span className="font-medium">Responding:</span> {call.respondingOfficer}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredCalls.length === 0 && (
          <div className="text-center py-8 text-gray-500">No SOS calls match your search</div>
        )}
      </div>
    </div>
  )
}

