"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

export default function MapFilters() {
  const [incidentTypes, setIncidentTypes] = useState({
    emergency: true,
    theft: true,
    vandalism: true,
    disturbance: true,
    other: true,
  })

  const [timeRange, setTimeRange] = useState([7])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-3">Incident Types</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <Checkbox
              id="emergency"
              checked={incidentTypes.emergency}
              onCheckedChange={(checked) => setIncidentTypes({ ...incidentTypes, emergency: !!checked })}
            />
            <Label htmlFor="emergency" className="ml-2">
              Emergency
            </Label>
          </div>
          <div className="flex items-center">
            <Checkbox
              id="theft"
              checked={incidentTypes.theft}
              onCheckedChange={(checked) => setIncidentTypes({ ...incidentTypes, theft: !!checked })}
            />
            <Label htmlFor="theft" className="ml-2">
              Theft
            </Label>
          </div>
          <div className="flex items-center">
            <Checkbox
              id="vandalism"
              checked={incidentTypes.vandalism}
              onCheckedChange={(checked) => setIncidentTypes({ ...incidentTypes, vandalism: !!checked })}
            />
            <Label htmlFor="vandalism" className="ml-2">
              Vandalism
            </Label>
          </div>
          <div className="flex items-center">
            <Checkbox
              id="disturbance"
              checked={incidentTypes.disturbance}
              onCheckedChange={(checked) => setIncidentTypes({ ...incidentTypes, disturbance: !!checked })}
            />
            <Label htmlFor="disturbance" className="ml-2">
              Disturbance
            </Label>
          </div>
          <div className="flex items-center">
            <Checkbox
              id="other"
              checked={incidentTypes.other}
              onCheckedChange={(checked) => setIncidentTypes({ ...incidentTypes, other: !!checked })}
            />
            <Label htmlFor="other" className="ml-2">
              Other
            </Label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Time Range</h3>
        <div className="px-2">
          <Slider defaultValue={[7]} max={30} min={1} step={1} value={timeRange} onValueChange={setTimeRange} />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>1 day</span>
            <span>{timeRange[0]} days</span>
            <span>30 days</span>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button className="w-full">Apply Filters</Button>
      </div>
    </div>
  )
}

