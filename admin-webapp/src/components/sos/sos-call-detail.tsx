'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  PhoneCall, MapPin, Clock, User, MessageSquare, 
  FileText, CheckCircle, AlertTriangle, Play, Pause, Volume2 
} from 'lucide-react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { SosReport, formatLocation, getAudioUrl } from '@/lib/sos-utils'
import { Progress } from '@/components/ui/progress'

interface SosCallDetailProps {
  sosReport: SosReport
}

export default function SosCallDetail({ sosReport }: SosCallDetailProps) {
  const [activeTab, setActiveTab] = useState('details')
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioReady, setAudioReady] = useState(false)

  // Configure audio player
  useEffect(() => {
    if (!sosReport?.audio_url) return

    const audioUrl = getAudioUrl(sosReport.audio_url)
    if (!audioUrl) return

    // Create audio element
    const audio = new Audio(audioUrl)
    audioRef.current = audio

    // Setup event listeners
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration)
      setAudioReady(true)
    })

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)
      setProgress((audio.currentTime / audio.duration) * 100)
    })

    audio.addEventListener('ended', () => {
      setIsPlaying(false)
      setProgress(0)
      setCurrentTime(0)
    })

    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [sosReport.audio_url])

  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    
    setIsPlaying(!isPlaying)
  }

  // Format time in seconds to MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  // Initialize map when component mounts and sosReport changes
  useEffect(() => {
    if (!mapContainer.current) return

    // Get coordinates from location
let lat = 19.0760, lng = 72.8777;  // Default to Mumbai coordinates

if (sosReport.location) {
  if (typeof sosReport.location === 'string') {
    try {
      const locationObj = JSON.parse(sosReport.location);
      if (locationObj.coordinates) {
        lat = locationObj.coordinates.latitude || lat;
        lng = locationObj.coordinates.longitude || lng;
      }
    } catch (e) {
      console.error('Failed to parse location', e);
    }
  } else if (sosReport.location.coordinates) {
    lat = sosReport.location.coordinates.latitude || lat;
    lng = sosReport.location.coordinates.longitude || lng;
  }
}

    // Initialize map
    if (map.current) map.current.remove()

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://api.maptiler.com/maps/streets/style.json?key=HeRB5Dr0kIRxuboMfGuL',
      center: [lng, lat],
      zoom: 14,
    })

    // Add marker for SOS location
    new maplibregl.Marker({ color: '#ef4444' })
      .setLngLat([lng, lat])
      .addTo(map.current)

    // Add navigation control
    map.current.addControl(new maplibregl.NavigationControl())

    return () => {
      if (map.current && typeof map.current.remove === 'function') {
        map.current.remove()
        map.current = null
      }
    }
    
  }, [sosReport, activeTab])

  return (
    <div className="p-6">
      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="details">Call Details</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="audio">Audio Recording</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              className="bg-white border border-gray-200 rounded-lg p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-medium mb-4">Call Information</h3>

              <div className="space-y-3">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Timestamp</p>
                    <p className="text-sm text-gray-600">{new Date(sosReport.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">User ID</p>
                    <p className="text-sm text-gray-600">{sosReport.user_id}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <PhoneCall className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Emergency Contact</p>
                    <p className="text-sm text-gray-600">{sosReport.emergency_contact || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge
                      className={
                        sosReport.status === 'pending'
                          ? 'bg-red-500'
                          : sosReport.status === 'responding'
                            ? 'bg-amber-500'
                            : 'bg-green-500'
                      }
                    >
                      {sosReport.status === 'pending'
                        ? 'Active'
                        : sosReport.status === 'responding'
                          ? 'Responding'
                          : 'Resolved'}
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white border border-gray-200 rounded-lg p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h3 className="text-lg font-medium mb-4">Emergency Details</h3>

              <div className="space-y-3">
                <div className="flex items-start">
                  <MessageSquare className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Report Details</p>
                    <p className="text-sm text-gray-600">{sosReport.additional_details || 'No additional details provided'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-gray-600">{formatLocation(sosReport.location)}</p>
                  </div>
                </div>

                {sosReport.audio_url && (
                  <div className="flex items-start">
                    <Volume2 className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Audio Recording</p>
                      <p className="text-sm text-gray-600">Audio statement available (see Audio tab)</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div
            className="bg-white border border-gray-200 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h3 className="text-lg font-medium mb-4">Response Actions</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sosReport.emergency_contact && (
                <Button className="w-full">
                  <PhoneCall className="h-4 w-4 mr-2" />
                  Call {sosReport.emergency_contact}
                </Button>
              )}

              <Button className="w-full" variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                Get Directions
              </Button>

              <Button className="w-full" variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Dispatch Emergency Services
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="location">
          <motion.div
            className="bg-white border border-gray-200 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-medium mb-4">Location Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
              <div>
  <p className="text-sm font-medium">Address/Location</p>
  <p className="text-sm text-gray-600">{formatLocation(sosReport.location)}</p>
</div>

<div>
  <p className="text-sm font-medium">Coordinates</p>
  {typeof sosReport.location === 'object' && 
   sosReport.location && 
   sosReport.location.coordinates && 
   sosReport.location.coordinates.latitude && 
   sosReport.location.coordinates.longitude ? (
    <p className="text-sm text-gray-600">
      Lat: {sosReport.location.coordinates.latitude}, Long: {sosReport.location.coordinates.longitude}
    </p>
  ) : (
    <p className="text-sm text-gray-600">Coordinates not available</p>
  )}
</div>

                <div>
                  <p className="text-sm font-medium">Reported Time</p>
                  <p className="text-sm text-gray-600">{new Date(sosReport.created_at).toLocaleString()}</p>
                </div>

                <Button className="w-full">
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </div>

              <div className="md:col-span-2">
                <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200">
                  <div ref={mapContainer} className="h-full w-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="audio">
          <motion.div
            className="bg-white border border-gray-200 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-medium mb-4">Audio Recording</h3>

            {!sosReport.audio_url ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Volume2 className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-600">No audio recording available</h3>
                <p className="text-gray-500 mt-1">
                  This SOS report does not include an audio recording.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-full bg-primary text-white hover:bg-primary/90"
                      onClick={togglePlay}
                      disabled={!audioReady}
                    >
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>

                    <div className="ml-4 flex-1">
                      <div className="flex justify-between text-sm">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      <Progress value={progress} className="h-2 mt-1" />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Recording Information</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Source:</span> Emergency call recording
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Recorded at:</span> {new Date(sosReport.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Location:</span> {formatLocation(sosReport.location)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Report Details</h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm border border-gray-200">
                    <p>{sosReport.additional_details || "No additional details provided with this recording."}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Transcribe Audio
                  </Button>
                  <Button>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Reviewed
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}