"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PhoneCall, MapPin, Clock, User, MessageSquare, FileText, CheckCircle, AlertTriangle } from "lucide-react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { useEffect, useRef } from "react"

export default function SosCallDetail({ call }) {
  const [activeTab, setActiveTab] = useState("details")
  const mapContainer = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (!call || !mapContainer.current) return

    // Initialize map
    if (map.current) map.current.remove()

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=HeRB5Dr0kIRxuboMfGuL`,
      center: [-74.006, 40.7128], // New York City coordinates
      zoom: 14,
    })

    // Add marker for SOS location
    const marker = new maplibregl.Marker({ color: "#ef4444" }).setLngLat([-74.006, 40.7128]).addTo(map.current)

    // Add navigation control
    map.current.addControl(new maplibregl.NavigationControl())

    return () => {
      if (map.current) map.current.remove()
    }
  }, [call])

  if (!call) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
        <PhoneCall className="h-12 w-12 mb-4 text-gray-300" />
        <p>Select an SOS call to view details</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">{call.location}</h2>
          <div className="flex items-center mt-1">
            <span className="text-sm text-gray-500 mr-2">Call ID: {call.id}</span>
            <Badge
              className={
                call.status === "Active" ? "bg-red-500" : call.status === "Responding" ? "bg-amber-500" : "bg-green-500"
              }
            >
              {call.status}
            </Badge>
          </div>
        </div>

        <div className="flex space-x-2 mt-4 md:mt-0">
          {call.status === "Active" && <Button>Respond to Call</Button>}
          {call.status === "Responding" && <Button>Mark as Resolved</Button>}
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="details">Call Details</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              className="bg-white border border-gray-200 rounded-lg p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-medium mb-4">Call Information</h3>

              <div className="space-y-3">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Timestamp</p>
                    <p className="text-sm text-gray-600">{new Date(call.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Received By</p>
                    <p className="text-sm text-gray-600">{call.receivedBy}</p>
                  </div>
                </div>

                {call.respondingOfficer && (
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Responding Officer</p>
                      <p className="text-sm text-gray-600">{call.respondingOfficer}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <PhoneCall className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Caller Information</p>
                    <p className="text-sm text-gray-600">{call.callerName}</p>
                    <p className="text-sm text-gray-600">{call.callerPhone}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white border border-gray-200 rounded-lg p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h3 className="text-lg font-medium mb-4">Emergency Details</h3>

              <div className="space-y-3">
                <div className="flex items-start">
                  <MessageSquare className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-gray-600">{call.description}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Priority Level</p>
                    <Badge
                      className={
                        call.priority === "High"
                          ? "bg-red-500"
                          : call.priority === "Medium"
                            ? "bg-amber-500"
                            : "bg-blue-500"
                      }
                    >
                      {call.priority}
                    </Badge>
                  </div>
                </div>

                {call.notes && (
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Additional Notes</p>
                      <p className="text-sm text-gray-600">{call.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div
            className="bg-white border border-gray-200 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h3 className="text-lg font-medium mb-4">Response Actions</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="w-full">
                <PhoneCall className="h-4 w-4 mr-2" />
                Call Back
              </Button>
              <Button className="w-full" variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
              <Button className="w-full" variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Escalate
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="location">
          <motion.div
            className="bg-white border border-gray-200 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-medium mb-4">Location Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-gray-600">{call.location}</p>
                </div>

                <div>
                  <p className="text-sm font-medium">Coordinates</p>
                  <p className="text-sm text-gray-600">40.7128° N, 74.0060° W</p>
                </div>

                <div>
                  <p className="text-sm font-medium">Nearest Landmarks</p>
                  <ul className="text-sm text-gray-600 list-disc pl-5 mt-1">
                    <li>Central Park (0.5 miles)</li>
                    <li>City Hospital (1.2 miles)</li>
                    <li>Police Station #4 (0.8 miles)</li>
                  </ul>
                </div>

                <Button className="w-full">
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </div>

              <div className="md:col-span-2">
                <div className="h-[300px] rounded-lg overflow-hidden">
                  <div ref={mapContainer} className="h-full w-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="timeline">
          <motion.div
            className="bg-white border border-gray-200 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-medium mb-4">Call Timeline</h3>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>

              <div className="space-y-6">
                {[
                  {
                    title: "Call Received",
                    description: `Emergency call received from ${call.callerName}`,
                    timestamp: call.timestamp,
                    icon: PhoneCall,
                    status: "complete",
                  },
                  {
                    title: "Dispatcher Assessment",
                    description: `Call assessed by ${call.receivedBy}`,
                    timestamp: new Date(new Date(call.timestamp).getTime() + 2 * 60000).toISOString(),
                    icon: User,
                    status: "complete",
                  },
                  {
                    title: "Officer Assigned",
                    description: call.respondingOfficer
                      ? `${call.respondingOfficer} assigned to respond`
                      : "Pending officer assignment",
                    timestamp: call.respondingOfficer
                      ? new Date(new Date(call.timestamp).getTime() + 5 * 60000).toISOString()
                      : "",
                    icon: AlertTriangle,
                    status: call.respondingOfficer ? "complete" : "pending",
                  },
                  {
                    title: "Officer En Route",
                    description: call.respondingOfficer
                      ? `${call.respondingOfficer} en route to location`
                      : "Pending officer dispatch",
                    timestamp: call.respondingOfficer
                      ? new Date(new Date(call.timestamp).getTime() + 8 * 60000).toISOString()
                      : "",
                    icon: MapPin,
                    status: call.respondingOfficer && call.status !== "Active" ? "complete" : "pending",
                  },
                  {
                    title: "Situation Resolved",
                    description: "Emergency situation addressed and resolved",
                    timestamp:
                      call.status === "Resolved"
                        ? new Date(new Date(call.timestamp).getTime() + 45 * 60000).toISOString()
                        : "",
                    icon: CheckCircle,
                    status: call.status === "Resolved" ? "complete" : "pending",
                  },
                ].map((item, index) => (
                  <div key={index} className="relative pl-10">
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
                            item.status === "complete"
                              ? "default"
                              : item.status === "in-progress"
                                ? "outline"
                                : "secondary"
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
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

