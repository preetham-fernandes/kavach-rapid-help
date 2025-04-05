import Header from "@/components/header"
import EvidenceTable from "@/components/evidence/evidence-table"
import EvidenceFilters from "@/components/evidence/evidence-filters"
import EvidencePreview from "@/components/evidence/evidence-preview"

export default function EvidencePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Evidence Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
            <EvidenceFilters />
          </div>
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-4">
              <EvidenceTable />
            </div>
            <div className="bg-white rounded-lg shadow p-4 mt-6">
              <EvidencePreview />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

