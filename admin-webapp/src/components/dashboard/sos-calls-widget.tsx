"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { mockSosCalls } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PhoneCall, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function SosCallsWidget() {
  const [hoveredCall, setHoveredCall] = useState<string | null>(null)

  // Get the 5 most recent SOS calls
  const recentCalls = [...mockSosCalls]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recentCalls.map((call) => (
          <motion.div
            key={call.id}
            className="bg-white border border-gray-200 rounded-lg p-4 relative overflow-hidden"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
            onHoverStart={() => setHoveredCall(call.id)}
            onHoverEnd={() => setHoveredCall(null)}
          >
            {/* Animated background indicator */}
            {hoveredCall === call.id && (
              <motion.div
                className="absolute inset-0 bg-red-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 0.2 }}
              />
            )}

            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 mr-3">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{call.location}</h3>
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

            <div className="mt-3 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-700">
                  <span className="font-medium">Received by:</span> {call.receivedBy}
                </p>
                {call.respondingOfficer && (
                  <p className="text-xs text-gray-700">
                    <span className="font-medium">Responding:</span> {call.respondingOfficer}
                  </p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center pt-2">
        <Button asChild variant="outline">
          <Link href="/sos">View All SOS Calls</Link>
        </Button>
      </div>
    </div>
  )
}

