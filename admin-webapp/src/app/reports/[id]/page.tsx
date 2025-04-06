import Header from "@/components/header"
import ReportHeader from "@/components/reports/report-header"
import ReportDetails from "@/components/reports/report-details"
import ReportLocation from "@/components/reports/report-location"
import ReportEvidence from "@/components/reports/report-evidence"
import ReportTimeline from "@/components/reports/report-timeline"
import { mockReports } from "@/lib/mock-data"

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  // In a real app, we would fetch the report data from an API
  const report = mockReports.find((r) => r.id === params.id) || mockReports[0]

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <ReportHeader report={report} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <ReportDetails report={report} />
            </div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <ReportEvidence report={report} />
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <ReportLocation report={report} />
            </div>
            {/* <div className="bg-white rounded-lg shadow p-6">
              <ReportTimeline report={report} />
            </div> */}
          </div>
        </div>
      </div>
    </main>
  )
}

