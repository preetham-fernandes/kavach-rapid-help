"use client"

import { useState, useEffect } from "react"
import { MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loader } from "@googlemaps/js-api-loader"

export default function ReportLocation({ report }) {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState(null)
  const [locationData, setLocationData] = useState(null)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)

  // Google Maps API key
  const apiKey = "AIzaSyBBvL8nLBGaoN68zlM1DM7wxau2KN1AknY";

  useEffect(() => {
    // Load Google Maps API
    const loader = new Loader({
      apiKey: apiKey,
      version: "weekly"
    });

    loader.load().then(() => {
      setGoogleMapsLoaded(true);
    }).catch(err => {
      console.error("Error loading Google Maps API:", err);
      setMapLoaded(true); // Still set as loaded to prevent further attempts
    });

    // Parse location data from report
    try {
      const parsedLocation = typeof report.location === 'string' 
        ? JSON.parse(report.location) 
        : report.location;

      if (parsedLocation && parsedLocation.coordinates) {
        setLocationData(parsedLocation);
      }
    } catch (e) {
      console.error('Error parsing location data:', e);
    }

    return () => {
      // Cleanup - no need to remove instance with Google Maps
      setMapInstance(null);
    };
  }, [report]);

  useEffect(() => {
    if (!locationData || !googleMapsLoaded || mapLoaded) return;

    // Initialize map only if we have location data and Google Maps is loaded
    const initMap = async () => {
      const mapContainer = document.getElementById('location-map');
      if (!mapContainer) return;

      try {
        const { latitude, longitude } = locationData.coordinates;

        // Validate coordinates
        if (!latitude || !longitude || 
            isNaN(parseFloat(latitude)) || 
            isNaN(parseFloat(longitude))) {
          throw new Error('Invalid coordinates');
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        
        // Create the Google Map
        const mapOptions = {
          center: { lat, lng },
          zoom: 14,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          mapId: "DEMO_MAP_ID" // Optional: Use a custom map style
        };

        const map = new google.maps.Map(mapContainer, mapOptions);
        
        // Add marker at the location
        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: "Complaint Location",
          animation: google.maps.Animation.DROP
        });

        // Optional: Add an info window with the address
        if (locationData.address) {
          const infoWindow = new google.maps.InfoWindow({
            content: `<div style="font-family: Arial, sans-serif; font-size: 12px; padding: 5px;">
                        <strong>Location:</strong><br>${locationData.address}
                      </div>`
          });
          
          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
        }

        setMapInstance(map);
        setMapLoaded(true);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapLoaded(true); // Still set as loaded to prevent further attempts
      }
    };

    initMap();
  }, [locationData, googleMapsLoaded, mapLoaded]);

  const getAddress = () => {
    if (!locationData) return "Location data not available";
    return locationData.address || "Address not provided";
  };

  const getCoordinates = () => {
    if (!locationData || !locationData.coordinates) return { lat: "N/A", lng: "N/A" };
    
    const { latitude, longitude } = locationData.coordinates;
    return { 
      lat: latitude ? parseFloat(latitude).toFixed(6) : "N/A", 
      lng: longitude ? parseFloat(longitude).toFixed(6) : "N/A" 
    };
  };

  const handleGetDirections = () => {
    if (!locationData || !locationData.coordinates) return;
    
    const { latitude, longitude } = locationData.coordinates;
    if (!latitude || !longitude) return;
    
    // Open Google Maps in a new tab
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
  };

  const coordinates = getCoordinates();

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Location</h3>

      <div className="space-y-4">
        <div className="h-[200px] bg-gray-100 rounded-lg overflow-hidden relative" id="location-map">
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          {(!locationData || !locationData.coordinates) && mapLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <MapPin className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">Location data not available</p>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500">Address</h4>
          <p className="text-sm mt-1">{getAddress()}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Latitude</h4>
            <p className="text-sm mt-1">{coordinates.lat}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Longitude</h4>
            <p className="text-sm mt-1">{coordinates.lng}</p>
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={handleGetDirections}
          disabled={!locationData || !locationData.coordinates}
        >
          <Navigation className="h-4 w-4 mr-2" />
          Get Directions
        </Button>
      </div>
    </div>
  );
}