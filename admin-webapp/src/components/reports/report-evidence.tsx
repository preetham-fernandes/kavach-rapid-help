"use client"

import { useState, useEffect } from "react"
import { File, Image, FileText, Download, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ReportEvidenceProps {
  report: any
  onUpdateEvidenceStatus: (status: string) => Promise<boolean>
  updating: boolean
}

export default function ReportEvidence({ report, onUpdateEvidenceStatus, updating }: ReportEvidenceProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [openPreview, setOpenPreview] = useState(false)

  useEffect(() => {
    // Initialize evidence info
    if (report.evidence_url) {
      setImageUrl(report.evidence_url)
    }
  }, [report])

  const handleMarkAsReviewed = async () => {
    if (report.evidence_status === 'reviewed') return
    
    const success = await onUpdateEvidenceStatus('reviewed')
    setOpenPreview(false)
    return success
  }

  const formatEvidenceStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  if (!report.evidence_url) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Evidence & Media</h3>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No evidence was provided with this complaint.</p>
          <p className="text-sm text-gray-400 mt-1">
            {report.is_anonymous ? 
              "This is an anonymous report without evidence." : 
              "The user did not upload any images or documents with this report."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Evidence & Media</h3>

      <Tabs defaultValue="evidence">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="evidence" className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-500 mr-3">
                  <Image className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Evidence Image</p>
                  <p className="text-xs text-gray-500">Uploaded with complaint</p>
                </div>
              </div>
              <Badge
                variant={report.evidence_status === "reviewed" ? "default" : "outline"}
                className={report.evidence_status === "reviewed" ? "bg-green-500" : ""}
              >
                {formatEvidenceStatus(report.evidence_status)}
              </Badge>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              {imageError ? (
                <div className="flex flex-col items-center justify-center h-[300px] p-4">
                  <FileText className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500 text-center">
                    Failed to load evidence image. The image may have been removed or the URL is invalid.
                  </p>
                </div>
              ) : (
                <div className="relative h-[300px] flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Evidence"
                    onError={handleImageError}
                    className="max-h-full max-w-full object-contain"
                  />
                  <AlertDialog open={openPreview} onOpenChange={setOpenPreview}>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="absolute bottom-4 right-4"
                      >
                        View Full Image
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-[90vw] max-h-[90vh]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Evidence Preview</AlertDialogTitle>
                        <AlertDialogDescription>
                          Uploaded with complaint on {new Date(report.created_at).toLocaleString()}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex items-center justify-center py-4">
                        <img
                          src={imageUrl}
                          alt="Evidence"
                          className="max-h-[60vh] max-w-full object-contain"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                        {report.evidence_status !== 'reviewed' && (
                          <AlertDialogAction onClick={handleMarkAsReviewed} disabled={updating}>
                            Mark as Reviewed
                          </AlertDialogAction>
                        )}
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" size="sm" asChild>
                <a href={imageUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download Evidence
                </a>
              </Button>

              {report.evidence_status !== 'reviewed' ? (
                <Button 
                  size="sm" 
                  onClick={handleMarkAsReviewed}
                  disabled={updating}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Reviewed
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-green-50 text-green-700 border-green-200"
                  disabled
                >
                  <Check className="h-4 w-4 mr-2" />
                  Evidence Reviewed
                </Button>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3">Evidence Verification Checklist</h4>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="mt-0.5 mr-3">
                  {report.evidence_status === 'reviewed' ? (
                    <span className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </span>
                  ) : (
                    <span className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center">
                      <X className="h-3 w-3 text-gray-400" />
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Evidence Reviewed</p>
                  <p className="text-xs text-gray-500">Mark evidence as reviewed after proper verification</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-700 mb-4">
                  Before marking evidence as reviewed, please ensure you've checked the following:
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="h-5 w-5 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center mr-2">
                      <span className="text-xs">1</span>
                    </span>
                    <span>The evidence is relevant to the complaint</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-5 w-5 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center mr-2">
                      <span className="text-xs">2</span>
                    </span>
                    <span>The image is clear and can be used for investigation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-5 w-5 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center mr-2">
                      <span className="text-xs">3</span>
                    </span>
                    <span>No potential privacy violations are present</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-5 w-5 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center mr-2">
                      <span className="text-xs">4</span>
                    </span>
                    <span>The evidence has been saved for record-keeping if needed</span>
                  </li>
                </ul>
              </div>

              {report.evidence_status !== 'reviewed' && (
                <Button 
                  className="w-full mt-4" 
                  onClick={handleMarkAsReviewed}
                  disabled={updating}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Evidence Review
                </Button>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}