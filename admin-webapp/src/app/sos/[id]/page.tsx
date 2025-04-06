'use client'

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Header from "@/components/header"
import SosCallDetail from "@/components/sos/sos-call-detail"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fetchSosReportById, SosReport, formatLocation, getStatusBadgeColor, updateSosReportStatus } from "@/lib/sos-utils"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, AlertTriangle, PhoneCall, Clipboard } from "lucide-react"
import Link from "next/link"

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

export default function SosDetailPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<SosReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true)
        const data = await fetchSosReportById(params.id)
        setReport(data)
      } catch (err) {
        console.error("Error loading SOS report:", err)
        setError("Failed to load SOS report details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadReport()
  }, [params.id])

  const handleStatusUpdate = async (newStatus: 'pending' | 'responding' | 'resolved') => {
    if (!report) return

    try {
      setUpdating(true)
      await updateSosReportStatus(report.id, newStatus)
      
      // Update local state
      setReport({
        ...report,
        status: newStatus
      })
      
      toast({
        title: "Status updated",
        description: `SOS call status has been updated to ${newStatus}`,
      })
    } catch (err) {
      console.error("Error updating status:", err)
      toast({
        title: "Update failed",
        description: "Failed to update the SOS call status. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <motion.div className="container mx-auto px-4 py-6" initial="hidden" animate="show" variants={container}>
        <Link href="/sos" className="flex items-center text-gray-500 hover:text-primary mb-4">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to SOS Calls
        </Link>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : !report ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-600">SOS report not found</h3>
            <p className="text-gray-500 mt-1">
              The requested SOS report could not be found or you don't have access to it.
            </p>
          </div>
        ) : (
          <>
            <motion.div variants={item} className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
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
                      <h1 className="text-2xl font-bold text-gray-900">{formatLocation(report.location)}</h1>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500 mr-2">ID: {report.id.substring(0, 8)}</span>
                        <Badge className={getStatusBadgeColor(report.status)}>
                          {report.status === "pending" ? "Active" : 
                          report.status === "responding" ? "Responding" : "Resolved"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 md:mt-0">
                  {report.status === "pending" && (
                    <Button 
                      onClick={() => handleStatusUpdate("responding")}
                      disabled={updating}
                    >
                      Respond to Call
                    </Button>
                  )}
                  {report.status === "responding" && (
                    <Button 
                      onClick={() => handleStatusUpdate("resolved")}
                      disabled={updating}
                    >
                      Mark as Resolved
                    </Button>
                  )}
                  {report.status === "resolved" && (
                    <Button 
                      onClick={() => handleStatusUpdate("pending")}
                      variant="outline"
                      disabled={updating}
                    >
                      Reopen Call
                    </Button>
                  )}
                  <Button variant="outline">
                    <Clipboard className="h-4 w-4 mr-2" />
                    Create Report
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.div variants={item}>
              <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <SosCallDetail sosReport={report} />
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  )
}