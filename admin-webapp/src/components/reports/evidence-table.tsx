"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Image, FileAudio, MoreHorizontal, Download, Eye, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock evidence data
const evidenceItems = [
  {
    id: "EV-001",
    name: "Witness Statement.pdf",
    type: "Document",
    reportId: "RPT-001",
    dateAdded: "2023-06-15T10:30:00",
    status: "Reviewed",
    icon: FileText,
  },
  {
    id: "EV-002",
    name: "Crime Scene Photo 1.jpg",
    type: "Image",
    reportId: "RPT-001",
    dateAdded: "2023-06-15T11:15:00",
    status: "Pending Review",
    icon: Image,
  },
  {
    id: "EV-003",
    name: "Audio Recording.mp3",
    type: "Audio",
    reportId: "RPT-002",
    dateAdded: "2023-06-16T09:45:00",
    status: "Reviewed",
    icon: FileAudio,
  },
  {
    id: "EV-004",
    name: "Police Report.pdf",
    type: "Document",
    reportId: "RPT-003",
    dateAdded: "2023-06-17T14:20:00",
    status: "Pending Review",
    icon: FileText,
  },
  {
    id: "EV-005",
    name: "Surveillance Footage.mp4",
    type: "Video",
    reportId: "RPT-004",
    dateAdded: "2023-06-18T16:10:00",
    status: "Verified",
    icon: FileAudio,
  },
  {
    id: "EV-006",
    name: "Evidence Photo 2.jpg",
    type: "Image",
    reportId: "RPT-005",
    dateAdded: "2023-06-19T11:30:00",
    status: "Verified",
    icon: Image,
  },
  {
    id: "EV-007",
    name: "Witness Statement 2.pdf",
    type: "Document",
    reportId: "RPT-006",
    dateAdded: "2023-06-20T13:45:00",
    status: "Pending Review",
    icon: FileText,
  },
]

export default function EvidenceTable() {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectedEvidence, setSelectedEvidence] = useState(null)

  const toggleSelectAll = () => {
    if (selectedItems.length === evidenceItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(evidenceItems.map((item) => item.id))
    }
  }

  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Evidence Items</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" disabled={selectedItems.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Download Selected
          </Button>
          <Button size="sm" disabled={selectedItems.length === 0}>
            <Eye className="h-4 w-4 mr-2" />
            Review Selected
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedItems.length === evidenceItems.length && evidenceItems.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Evidence ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Report ID</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evidenceItems.map((item) => (
              <TableRow
                key={item.id}
                className={selectedEvidence === item.id ? "bg-primary/5" : undefined}
                onClick={() => setSelectedEvidence(item.id)}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => toggleSelectItem(item.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-500 mr-3">
                      <item.icon className="h-4 w-4" />
                    </div>
                    {item.name}
                  </div>
                </TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.reportId}</TableCell>
                <TableCell>{new Date(item.dateAdded).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      item.status === "Verified"
                        ? "bg-green-500"
                        : item.status === "Reviewed"
                          ? "bg-blue-500"
                          : "bg-amber-500"
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

