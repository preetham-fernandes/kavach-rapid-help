"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

// If you don't have this mock data file, I've included a sample implementation below
// You can replace this import with the mock data directly in this file if needed
export const mockReports = [
  {
    id: "report-1",
    title: "Domestic Dispute",
    description: "Loud argument and possible domestic altercation reported by neighbors in apartment complex",
    location: { address: "742 Patel Housing Society, Andheri West", coordinates: [72.8296, 19.1195] },
    timestamp: "2024-02-28T15:30:00Z",
    priority: "High",
    status: "Active",
  },
  {
    id: "report-2",
    title: "Vehicle Theft",
    description: "Two-wheeler stolen from parking area, no CCTV coverage in the vicinity",
    location: { address: "123 MG Road, Bengaluru", coordinates: [77.6197, 12.9756] },
    timestamp: "2024-02-28T14:15:00Z",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: "report-3",
    title: "Noise Complaint",
    description: "Loud DJ music from wedding celebration disturbing residential area after permitted hours",
    location: { address: "456 Vivekanand Nagar, Pune", coordinates: [73.8567, 18.5204] },
    timestamp: "2024-02-28T18:45:00Z",
    priority: "Low",
    status: "New",
  },
  {
    id: "report-4",
    title: "Suspicious Person",
    description: "Individual checking parked vehicles and trying door handles near shopping complex",
    location: { address: "789 Sector 18, Noida", coordinates: [77.3910, 28.5697] },
    timestamp: "2024-02-28T20:10:00Z",
    priority: "Medium",
    status: "Active",
  },
  {
    id: "report-5",
    title: "Mobile Phone Snatching",
    description: "Phone snatched by individuals on motorcycle, fled towards main highway",
    location: { address: "101 Linking Road, Bandra", coordinates: [72.8296, 19.0596] },
    timestamp: "2024-02-28T16:20:00Z",
    priority: "Medium",
    status: "Active",
  },
  {
    id: "report-6",
    title: "Medical Emergency",
    description: "Elderly resident collapsed in public park, requires immediate medical assistance",
    location: { address: "222 Lodhi Gardens, New Delhi", coordinates: [77.2272, 28.5917] },
    timestamp: "2024-02-28T12:05:00Z",
    priority: "High",
    status: "Resolved",
  },
  {
    id: "report-7",
    title: "Traffic Accident",
    description: "Auto-rickshaw and motorbike collision at signal, minor injuries reported",
    location: { address: "Junction of Anna Salai & Mount Road, Chennai", coordinates: [80.2707, 13.0827] },
    timestamp: "2024-02-28T07:50:00Z",
    priority: "High",
    status: "Active",
  },
  {
    id: "report-8",
    title: "Public Property Damage",
    description: "Bus shelter vandalized, suspect may have been caught on nearby ATM camera",
    location: { address: "650 Subhash Chowk, Gurgaon", coordinates: [77.0266, 28.4595] },
    timestamp: "2024-02-28T03:25:00Z",
    priority: "Low",
    status: "Pending",
  },
  {
    id: "report-9",
    title: "Missing Child",
    description: "7-year-old separated from family at Dussehra fair, wearing blue kurta",
    location: { address: "Ramlila Maidan, Old Delhi", coordinates: [77.2377, 28.6381] },
    timestamp: "2024-02-28T16:40:00Z",
    priority: "High",
    status: "Resolved",
  },
  {
    id: "report-10",
    title: "Unauthorized Street Vendor",
    description: "Illegal hawking activity blocking pedestrian pathway despite multiple warnings",
    location: { address: "888 Juhu Beach Road, Mumbai", coordinates: [72.8296, 19.0950] },
    timestamp: "2024-02-28T21:00:00Z",
    priority: "Low",
    status: "New",
  }
];

export default function DashboardMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    // Don't initialize if the container isn't ready
    if (!mapContainer.current) return

    try {
      // Initialize the map with proper maplibregl import
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/streets/style.json?key=HeRB5Dr0kIRxuboMfGuL`,
        center: [-74.006, 40.7128], // New York City coordinates
        zoom: 12,
      })

      // Add navigation controls (zoom in/out, etc.)
      map.current.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right"
      )

      // Handle map load completion
      map.current.on("load", () => {
        console.log("Map loaded successfully")
        setMapLoaded(true)

        // Add markers for incidents once map is loaded
        if (map.current) {
          // Use a subset of reports for demonstration
          mockReports.slice(0, 10).forEach((report, index) => {
            // Generate random positions near NYC for demonstration
            // In a real app, you would use actual coordinates from your data
            const lat = 40.7128 + (Math.random() * 0.02 - 0.01)
            const lng = -74.006 + (Math.random() * 0.02 - 0.01)

            // Create a custom marker element
            const el = document.createElement("div")
            el.className = "marker"
            el.style.width = "12px"
            el.style.height = "12px"
            el.style.borderRadius = "50%"
            el.style.cursor = "pointer"
            el.style.boxShadow = "0 0 0 2px white"

            // Set color based on priority
            if (report.priority === "High") {
              el.style.backgroundColor = "#ef4444" // Red
            } else if (report.priority === "Medium") {
              el.style.backgroundColor = "#f59e0b" // Amber
            } else {
              el.style.backgroundColor = "#3b82f6" // Blue
            }

            // Create and add the marker with popup
            new maplibregl.Marker(el)
              .setLngLat([lng, lat])
              .setPopup(
                new maplibregl.Popup({ offset: 25, closeButton: false })
                  .setHTML(
                    `<div class="p-2">
                      <h3 class="text-sm font-bold">${report.title}</h3>
                      <p class="text-xs">${report.location.address}</p>
                      <p class="text-xs mt-1 text-gray-500">${
                        report.description?.substring(0, 60) + "..." || ""
                      }</p>
                    </div>`
                  )
              )
              .addTo(map.current)
          })
        }
      })

      // Add error handling
      map.current.on("error", (e) => {
        console.error("Map error:", e)
        setMapError("Failed to load map properly")
      })

    } catch (err) {
      console.error("Error initializing map:", err)
      setMapError("Failed to initialize map")
    }

    // Cleanup function to properly remove the map instance when the component unmounts
    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, []) // Empty dependency array means this runs once on component mount

  return (
    <div className="relative h-[300px] rounded-lg overflow-hidden border border-gray-200">
      {/* Loading state */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error state */}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-red-500 flex flex-col items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className="mb-2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{mapError}</span>
          </div>
        </div>
      )}

      {/* Map container */}
      <motion.div
        ref={mapContainer}
        className="h-full w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: mapLoaded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />

      {/* Map legend */}
      <div className="absolute bottom-2 right-2 bg-white p-2 rounded-md shadow-sm text-xs z-20">
        <div className="flex items-center mb-1">
          <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
          <span>High Priority</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-2 h-2 rounded-full bg-amber-500 mr-1"></div>
          <span>Medium Priority</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
          <span>Low Priority</span>
        </div>
      </div>
    </div>
  )
}

// If you don't have a mock-data.ts file, you can use this sample data:
// Replace the import at the top with this constant

/*

*/

