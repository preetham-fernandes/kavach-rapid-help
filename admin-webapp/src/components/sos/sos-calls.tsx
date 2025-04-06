'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, PhoneCall, Clock } from 'lucide-react'
import { SosReport, formatLocation, getStatusBadgeColor } from '@/lib/sos-utils'
import Link from 'next/link'

interface SosCallsProps {
  reports: SosReport[]
  loading: boolean
}

export default function SosCalls({ reports, loading }: SosCallsProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter SOS calls based on search
  const filteredReports = reports.filter((report) => {
    const locationStr = formatLocation(report.location).toLowerCase()
    const detailsStr = (report.additional_details || '').toLowerCase()
    const contactStr = (report.emergency_contact || '').toLowerCase()
    const searchLower = searchQuery.toLowerCase()

    return (
      locationStr.includes(searchLower) ||
      detailsStr.includes(searchLower) ||
      contactStr.includes(searchLower)
    )
  })

  // Sort reports by priority and timestamp
  const sortedReports = [...filteredReports].sort((a, b) => {
    // First sort by status (pending > responding > resolved)
    const statusOrder = { pending: 0, responding: 1, resolved: 2 }
    const statusDiff = statusOrder[a.status] - statusOrder[b.status]

    if (statusDiff !== 0) return statusDiff

    // Then sort by created_at (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search SOS calls..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : sortedReports.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchQuery 
            ? "No SOS calls match your search criteria" 
            : "No SOS calls available"}
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          <AnimatePresence>
            {sortedReports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-3 border rounded-md cursor-pointer transition-colors hover:bg-gray-50"
              >
                <Link href={`/sos/${report.id}`} className="block">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                          report.status === 'pending'
                            ? 'bg-red-100 text-red-500'
                            : report.status === 'responding'
                              ? 'bg-amber-100 text-amber-500'
                              : 'bg-green-100 text-green-500'
                        }`}
                      >
                        <PhoneCall className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{formatLocation(report.location)}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(report.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusBadgeColor(report.status)}>
                      {report.status === 'pending'
                        ? 'Active'
                        : report.status === 'responding'
                          ? 'Responding'
                          : 'Resolved'}
                    </Badge>
                  </div>

                  <div className="mt-2 pl-11">
                    {report.emergency_contact && (
                      <p className="text-xs text-gray-700">
                        <span className="font-medium">Emergency Contact:</span> {report.emergency_contact}
                      </p>
                    )}
                    {report.additional_details && (
                      <p className="text-xs text-gray-700 line-clamp-1 mt-1">
                        <span className="font-medium">Details:</span> {report.additional_details}
                      </p>
                    )}
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(report.created_at).toLocaleString()}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}