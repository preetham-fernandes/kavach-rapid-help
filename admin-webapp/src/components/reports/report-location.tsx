"use client"

import { useState, useEffect } from "react"
import { MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ReportLocation({ report }) {
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Location</h3>

      <div className="space-y-4">
        <div className="h-[200px] bg-gray-100 rounded-lg overflow-hidden relative">
          {!mapLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-[#e8eaed]">
              {/* City streets grid simulation */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
                {Array.from({ length: 6 }).map((_, rowIndex) =>
                  Array.from({ length: 6 }).map((_, colIndex) => (
                    <div key={`${rowIndex}-${colIndex}`} className="border border-gray-300" />
                  )),
                )}
              </div>

              {/* Incident marker */}
              <div className="absolute top-1/2 left-1/2 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
                <MapPin className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500">Address</h4>
          <p className="text-sm mt-1">{report.location.address}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Latitude</h4>
            <p className="text-sm mt-1">{report.location.coordinates?.lat || "N/A"}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Longitude</h4>
            <p className="text-sm mt-1">{report.location.coordinates?.lng || "N/A"}</p>
          </div>
        </div>

        <Button className="w-full">
          <Navigation className="h-4 w-4 mr-2" />
          Get Directions
        </Button>
      </div>
    </div>
  )
}

