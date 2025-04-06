"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Loader } from "@googlemaps/js-api-loader"

// Mock data for demonstration
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
  }
];

export default function DashboardMap() {
  const mapContainer = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const mapInstance = useRef(null)
  
  // Google Maps API key
  const apiKey = "AIzaSyBBvL8nLBGaoN68zlM1DM7wxau2KN1AknY";

  useEffect(() => {
    // Don't initialize if the container isn't ready
    if (!mapContainer.current) return

    try {
      // Initialize the Google Maps loader
      const loader = new Loader({
        apiKey: apiKey,
        version: "weekly"
      });

      // Load Google Maps API and initialize the map
      loader.load().then(() => {
        // Create the map
        const map = new google.maps.Map(mapContainer.current, {
          center: { lat: 21.1670, lng: 72.7822 }, // New York City coordinates 
          zoom: 12,
          mapId: "DEMO_MAP_ID", // Optional: Use a custom map style
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
          }
        });
        
        // Save map instance
        mapInstance.current = map;
        
        // Add markers for incidents
        mockReports.slice(0, 10).forEach((report, index) => {
          // Generate random positions near NYC for demonstration
          // In a real app, you would use actual coordinates from your data
          const lat = 40.7128 + (Math.random() * 0.02 - 0.01);
          const lng = -74.0060 + (Math.random() * 0.02 - 0.01);

          // Set marker color based on priority
          let markerColor;
          if (report.priority === "High") {
            markerColor = "#ef4444"; // Red
          } else if (report.priority === "Medium") {
            markerColor = "#f59e0b"; // Amber
          } else {
            markerColor = "#3b82f6"; // Blue
          }

          // Create SVG marker
          const svgMarker = {
            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
            fillColor: markerColor,
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: "#ffffff",
            rotation: 0,
            scale: 1.5,
            anchor: new google.maps.Point(12, 22),
          };

          // Create and add the marker
          const marker = new google.maps.Marker({
            position: { lat, lng },
            map: map,
            title: report.title,
            icon: svgMarker,
            animation: google.maps.Animation.DROP
          });

          // Create info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="font-family: Arial, sans-serif; max-width: 200px; padding: 8px;">
                <h3 style="margin: 0 0 5px; font-size: 14px; font-weight: 600;">${report.title}</h3>
                <p style="margin: 0 0 5px; font-size: 12px; color: #666;">${report.location.address}</p>
                <p style="margin: 0; font-size: 12px; color: #666;">${report.description?.substring(0, 60) + "..." || ""}</p>
              </div>
            `
          });

          // Add click listener
          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
        });

        setMapLoaded(true);
      }).catch(error => {
        console.error("Error loading Google Maps:", error);
        setMapError("Failed to load map properly");
        setMapLoaded(true); // Mark as loaded to remove spinner
      });
    } catch (err) {
      console.error("Error initializing map:", err);
      setMapError("Failed to initialize map");
      setMapLoaded(true); // Mark as loaded to remove spinner
    }

    // Cleanup function
    return () => {
      mapInstance.current = null;
    };
  }, []); // Empty dependency array means this runs once on component mount

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