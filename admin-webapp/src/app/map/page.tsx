import Header from "@/components/header"
import MapView from "@/components/maps/map-view"
import MapFilters from "@/components/maps/map-filters"
import MapReportsList from "@/components/maps/map-reports-list"
import MapDetailPanel from "@/components/maps/map-detail-panel"

export default function MapPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Incident Map</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
            <MapFilters />
            <MapReportsList />
          </div>
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-4 h-[600px]">
              <MapView />
            </div>
            <div className="bg-white rounded-lg shadow p-4 mt-6">
              <MapDetailPanel />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

