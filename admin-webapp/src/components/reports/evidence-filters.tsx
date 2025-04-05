"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function EvidenceFilters() {
  const [evidenceTypes, setEvidenceTypes] = useState({
    document: true,
    image: true,
    audio: true,
    video: true,
  })

  const [statusFilters, setStatusFilters] = useState({
    verified: true,
    reviewed: true,
    pending: true,
  })

  return (
    <div className="space-y-6">
      <div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input type="search" placeholder="Search evidence..." className="pl-9" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Evidence Type</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <Checkbox
              id="document"
              checked={evidenceTypes.document}
              onCheckedChange={(checked) => setEvidenceTypes({ ...evidenceTypes, document: !!checked })}
            />
            <Label htmlFor="document" className="ml-2">
              Documents
            </Label>
          </div>
          <div className="flex items-center">
            <Checkbox
              id="image"
              checked={evidenceTypes.image}
              onCheckedChange={(checked) => setEvidenceTypes({ ...evidenceTypes, image: !!checked })}
            />
            <Label htmlFor="image" className="ml-2">
              Images
            </Label>
          </div>
          <div className="flex items-center">
            <Checkbox
              id="audio"
              checked={evidenceTypes.audio}
              onCheckedChange={(checked) => setEvidenceTypes({ ...evidenceTypes, audio: !!checked })}
            />
            <Label htmlFor="audio" className="ml-2">
              Audio
            </Label>
          </div>
          <div className="flex items-center">
            <Checkbox
              id="video"
              checked={evidenceTypes.video}
              onCheckedChange={(checked) => setEvidenceTypes({ ...evidenceTypes, video: !!checked })}
            />
            <Label htmlFor="video" className="ml-2">
              Video
            </Label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Status</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <Checkbox
              id="verified"
              checked={statusFilters.verified}
              onCheckedChange={(checked) => setStatusFilters({ ...statusFilters, verified: !!checked })}
            />
            <Label htmlFor="verified" className="ml-2">
              Verified
            </Label>
          </div>
          <div className="flex items-center">
            <Checkbox
              id="reviewed"
              checked={statusFilters.reviewed}
              onCheckedChange={(checked) => setStatusFilters({ ...statusFilters, reviewed: !!checked })}
            />
            <Label htmlFor="reviewed" className="ml-2">
              Reviewed
            </Label>
          </div>
          <div className="flex items-center">
            <Checkbox
              id="pending"
              checked={statusFilters.pending}
              onCheckedChange={(checked) => setStatusFilters({ ...statusFilters, pending: !!checked })}
            />
            <Label htmlFor="pending" className="ml-2">
              Pending Review
            </Label>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button className="w-full">Apply Filters</Button>
      </div>
    </div>
  )
}

