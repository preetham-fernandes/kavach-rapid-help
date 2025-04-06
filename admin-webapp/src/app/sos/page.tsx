'use client'

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, PhoneCall, Clock, Calendar } from "lucide-react"
import Link from "next/link"
import { fetchSosReports, SosReport, formatLocation, getStatusBadgeColor } from "@/lib/sos-utils"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function SosPage() {
  const [reports, setReports] = useState<SosReport[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true)
        const data = await fetchSosReports()
        setReports(data)
      } catch (err) {
        console.error("Error loading SOS reports:", err)
        setError("Failed to load SOS reports. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [])

  // Filter reports based on search query
  const filteredReports = reports.filter((report) => {
    const locationStr = formatLocation(report.location).toLowerCase()
    const detailsStr = (report.additional_details || "").toLowerCase()
    const contactStr = (report.emergency_contact || "").toLowerCase()
    const searchLower = searchQuery.toLowerCase()

    return (
      locationStr.includes(searchLower) ||
      detailsStr.includes(searchLower) ||
      contactStr.includes(searchLower)
    )
  })

  return (
    <div className="min-h-screen">
      <Header />
      <motion.div className="container mx-auto px-4 py-6" initial="hidden" animate="show" variants={container}>
        <div className="flex justify-between items-center mb-6">
          <motion.h1 className="text-2xl font-bold text-gray-900" variants={item}>
            SOS Emergency Calls
          </motion.h1>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Filter by Date
            </Button>
            <Button>
              <PhoneCall className="h-4 w-4 mr-2" />
              Active Calls ({reports.filter(r => r.status === 'pending').length})
            </Button>
          </div>
        </div>

        <motion.div variants={item} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              type="search" 
              placeholder="Search by location, details, or emergency contact..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <PhoneCall className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-600">No SOS calls found</h3>
            <p className="text-gray-500 mt-1">
              {searchQuery ? "Try adjusting your search terms" : "There are currently no SOS calls in the system"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <Link href={`/sos/${report.id}`} key={report.id}>
                <motion.div
                  variants={item}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 
                          ${report.status === "pending" ? "bg-red-100 text-red-500" : 
                            report.status === "responding" ? "bg-amber-100 text-amber-500" : 
                            "bg-green-100 text-green-500"}`}
                      >
                        <PhoneCall className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium line-clamp-1">{formatLocation(report.location)}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1">{report.additional_details || "No details provided"}</p>
                      </div>
                    </div>
                    <Badge className={getStatusBadgeColor(report.status)}>
                      {report.status === "pending" ? "Active" : 
                       report.status === "responding" ? "Responding" : "Resolved"}
                    </Badge>
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(report.created_at).toLocaleString()}
                    </div>
                    {report.emergency_contact && (
                      <div className="text-sm font-medium">
                        📞 {report.emergency_contact}
                      </div>
                    )}
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}