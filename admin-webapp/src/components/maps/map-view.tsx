"use client"

import { useState, useEffect, useRef } from "react"
import { mockReports } from "@/lib/mock-data"
import { motion } from "framer-motion"
import { Loader } from "@googlemaps/js-api-loader"

export default function MapView() {
  const mapContainerRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [markers, setMarkers] = useState([])
  const mapInstanceRef = useRef(null)
  
  // Google Maps API key
  const apiKey = "AIzaSyBBvL8nLBGaoN68zlM1DM7wxau2KN1AknY";

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize the Google Maps loader
    const loader = new Loader({
      apiKey: apiKey,
      version: "weekly"
    });

    // Load Google Maps API and initialize the map
    loader.load().then(() => {
      // Create the map
      const map = new google.maps.Map(mapContainerRef.current, {
        center: { lat: 21.1669, lng: 72.7822 }, // New York City coordinates{"address": "Dumas Road, Dumas Road, Sardar Vallabhbhai National Institute of Technology, Surat, Gujarat, 395007, India", "latitude": 21.166936590068225, "longitude": 72.78226390065451}
        zoom: 12,
        mapId: "DEMO_MAP_ID", // Optional: Use a custom map style
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false
      });
      
      // Save map instance
      mapInstanceRef.current = map;
      
      // Add zoom controls
      const zoomControl = document.createElement('div');
      zoomControl.className = 'custom-zoom-control';
      map.controls[google.maps.ControlPosition.RIGHT_TOP].push(zoomControl);
      
      // Add markers for incidents
      const newMarkers = mockReports.map((report, index) => {
        // Generate random positions for the markers for demo purposes
        // In a real app, you would use actual coordinates from your data
        const lat = 40.7128 + (Math.random() * 0.05 - 0.025);
        const lng = -74.0060 + (Math.random() * 0.05 - 0.025);

        // Determine marker color based on incident type
        let markerColor;
        switch (report.type) {
          case "Emergency":
            markerColor = "#ef4444"; // red
            break;
          case "Theft":
            markerColor = "#f59e0b"; // amber
            break;
          case "Vandalism":
            markerColor = "#3b82f6"; // blue
            break;
          case "Disturbance":
            markerColor = "#8b5cf6"; // purple
            break;
          default:
            markerColor = "#6b7280"; // gray
        }

        // Create custom marker with SVG
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

        // Create the marker
        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: report.title,
          icon: svgMarker,
          animation: google.maps.Animation.DROP
        });

        // Create an info window for the marker
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="font-family: Arial, sans-serif; max-width: 250px; padding: 10px;">
              <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600;">${report.title}</h3>
              <p style="margin: 0 0 5px; font-size: 12px; color: #666;">${report.location.address}</p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #666;">Priority: ${report.priority}</p>
              <button 
                style="background: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer;"
                onclick="window.location.href='/reports/${report.id}'"
              >
                View Details
              </button>
            </div>
          `
        });

        // Add click event to marker
        marker.addListener("click", () => {
          // Close any open info windows
          markers.forEach(m => {
            if (m.infoWindow.getMap()) {
              m.infoWindow.close();
            }
          });
          
          // Open this marker's info window
          infoWindow.open(map, marker);
          setSelectedReport(report);
          
          // Pan to marker
          map.panTo(marker.getPosition());
        });

        return { 
          marker,
          infoWindow,
          report
        };
      });
      
      setMarkers(newMarkers);
      setMapLoaded(true);
      
    }).catch(err => {
      console.error("Error loading Google Maps:", err);
      setMapLoaded(true); // Mark as loaded to remove spinner
    });

    return () => {
      // Cleanup markers and map when component unmounts
      if (markers.length) {
        markers.forEach(m => {
          m.marker.setMap(null);
        });
      }
    };
  }, []);

  return (
    <div className="relative h-full rounded-lg overflow-hidden">
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      <motion.div
        ref={mapContainerRef}
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