"use client"

import { useState, useEffect, useRef } from "react"
import { mockReports } from "@/lib/mock-data"
import { motion } from "framer-motion"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)

  useEffect(() => {
    if (!mapContainer.current) return

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=HeRB5Dr0kIRxuboMfGuL`,
      center: [-74.006, 40.7128], // New York City coordinates
      zoom: 12,
    })

    // Add navigation control
    map.current.addControl(new maplibregl.NavigationControl())

    // Set map as loaded when it's ready
    map.current.on("load", () => {
      setMapLoaded(true)

      // Add markers for incidents
      if (map.current) {
        mockReports.forEach((report, index) => {
          // Generate random positions for the markers
          const lat = 40.7128 + (Math.random() * 0.05 - 0.025)
          const lng = -74.006 + (Math.random() * 0.05 - 0.025)

          // Create marker element
          const el = document.createElement("div")
          el.className = "marker"
          el.style.width = "16px"
          el.style.height = "16px"
          el.style.borderRadius = "50%"
          el.style.cursor = "pointer"
          el.style.boxShadow = "0 0 0 4px rgba(255,255,255,0.4)"
          el.style.transition = "all 0.2s ease"

          // Set color based on incident type
          let markerColor
          switch (report.type) {
            case "Emergency":
              markerColor = "#ef4444" // red
              break
            case "Theft":
              markerColor = "#f59e0b" // amber
              break
            case "Vandalism":
              markerColor = "#3b82f6" // blue
              break
            case "Disturbance":
              markerColor = "#8b5cf6" // purple
              break
            default:
              markerColor = "#6b7280" // gray
          }

          el.style.backgroundColor = markerColor

          // Add hover effect
          el.addEventListener("mouseenter", () => {
            el.style.transform = "scale(1.2)"
          })

          el.addEventListener("mouseleave", () => {
            el.style.transform = "scale(1)"
          })

          // Add marker to map
          const marker = new maplibregl.Marker(el)
            .setLngLat([lng, lat])
            .setPopup(
              new maplibregl.Popup({ offset: 25 }).setHTML(`
                <div class="p-2">
                  <h3 class="text-sm font-bold">${report.title}</h3>
                  <p class="text-xs">${report.location.address}</p>
                  <p class="text-xs mt-1">Priority: ${report.priority}</p>
                  <button class="text-xs mt-2 text-blue-500 hover:underline">View Details</button>
                </div>
              `),
            )
            .addTo(map.current!)

          // Handle click on marker
          el.addEventListener("click", () => {
            setSelectedReport(report)
          })
        })
      }
    })

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [])

  return (
    <div className="relative h-full rounded-lg overflow-hidden">
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      <motion.div
        ref={mapContainer}
        className="h-full w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: mapLoaded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />

      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-md shadow-md text-xs z-20">
        <div className="text-sm font-medium mb-2">Incident Types</div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <span>Emergency</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
          <span>Theft</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span>Vandalism</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
          <span>Disturbance</span>
        </div>
      </div>
    </div>
  )
}

