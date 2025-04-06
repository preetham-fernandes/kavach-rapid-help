"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import Header from "@/components/header"
import ReportHeader from "@/components/reports/report-header"
import ReportDetails from "@/components/reports/report-details"
import ReportLocation from "@/components/reports/report-location"
import ReportEvidence from "@/components/reports/report-evidence"
import ReportTimeline from "@/components/reports/report-timeline"

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchReportDetails()
  }, [params.id])

  const fetchReportDetails = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('complaint_id', params.id)
        .single()

      if (error) {
        throw error
      }

      if (!data) {
        toast({
          title: "Report not found",
          description: "The complaint report you're looking for doesn't exist or has been removed.",
          variant: "destructive"
        })
        router.push('/reports')
        return
      }

      setReport(data)
    } catch (error) {
      console.error('Error fetching report details:', error)
      toast({
        title: "Error",
        description: "Failed to load report details. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateReport = async (updates) => {
    try {
      setUpdating(true)
      
      const { data, error } = await supabase
        .from('complaints')
        .update(updates)
        .eq('complaint_id', params.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setReport(data)
      toast({
        title: "Updated successfully",
        description: "The report has been updated.",
      })
      
      return true
    } catch (error) {
      console.error('Error updating report:', error)
      toast({
        title: "Update failed",
        description: "Failed to update the report. Please try again.",
        variant: "destructive"
      })
      return false
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdatePriority = async (priority) => {
    return await updateReport({ priority })
  }

  const handleUpdateStatus = async (complaint_status) => {
    return await updateReport({ complaint_status })
  }

  const handleUpdateNotes = async (notes) => {
    return await updateReport({ notes })
  }

  const handleUpdateEvidenceStatus = async (evidence_status) => {
    return await updateReport({ evidence_status })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </main>
    )
  }

  if (!report) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Report Not Found</h1>
            <p className="text-gray-500 mb-6">The complaint report you're looking for doesn't exist or has been removed.</p>
            <button 
              onClick={() => router.push('/reports')}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Go Back to Reports
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <ReportHeader 
          report={report} 
          onUpdateStatus={handleUpdateStatus} 
          onUpdatePriority={handleUpdatePriority}
          updating={updating}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <ReportDetails report={report} onUpdateNotes={handleUpdateNotes} updating={updating} />
            </div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <ReportEvidence report={report} onUpdateEvidenceStatus={handleUpdateEvidenceStatus} updating={updating} />
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <ReportLocation report={report} />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <ReportTimeline report={report} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}