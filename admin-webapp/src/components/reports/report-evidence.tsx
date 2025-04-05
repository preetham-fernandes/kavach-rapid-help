"use client"

import { useState } from "react"
import { File, Image, FileText, Play, Pause, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

export default function ReportEvidence({ report }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const togglePlay = () => {
    setIsPlaying(!isPlaying)

    // Simulate audio progress
    if (!isPlaying) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 100)
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Evidence & Media</h3>

      <Tabs defaultValue="audio">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="audio">Audio Statement</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="audio" className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-primary text-white hover:bg-primary/90"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <div className="ml-4 flex-1">
                <div className="flex justify-between text-sm">
                  <span>
                    {Math.floor(progress / 10)}:0{Math.floor(progress % 10)}
                  </span>
                  <span>2:45</span>
                </div>
                <Progress value={progress} className="h-1 mt-1" />
              </div>

              <Button variant="ghost" size="icon" className="ml-2">
                <Download className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium">Transcript</h4>
              <div className="mt-2 text-sm text-gray-700 bg-white p-3 rounded border border-gray-200 max-h-40 overflow-y-auto">
                <p>
                  "I was walking home from work around 9:30 PM when I noticed suspicious activity near the convenience
                  store on Main Street. Two individuals in dark clothing were attempting to force open the back door.
                  When they saw me, they quickly left the scene heading east on Oak Avenue. One was wearing a black
                  hoodie and the other had on a dark baseball cap."
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">AI Summary</h4>
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <p>
                Witness observed two suspicious individuals attempting to break into the convenience store on Main
                Street at approximately 9:30 PM. Suspects fled eastward on Oak Avenue when spotted. One suspect wore a
                black hoodie, the other a dark baseball cap.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center"
              >
                <Image className="h-8 w-8 text-gray-400" />
                <div className="absolute inset-0 hover:bg-black/5 cursor-pointer"></div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="space-y-2">
            {[
              { name: "Initial Report.pdf", icon: FileText, size: "245 KB" },
              { name: "Witness Statement.docx", icon: FileText, size: "128 KB" },
              { name: "Evidence Log.xlsx", icon: File, size: "78 KB" },
            ].map((doc, index) => (
              <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg">
                <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-500">
                  <doc.icon className="h-5 w-5" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.size}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

