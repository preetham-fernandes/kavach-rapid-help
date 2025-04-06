"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Header from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Search, FileText, Filter, ArrowUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalReports, setTotalReports] = useState(0)
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState({ field: "created_at", direction: "desc" })
  
  const reportsPerPage = 10

  useEffect(() => {
    fetchReports()
  }, [currentPage, statusFilter, priorityFilter, sortOrder])

  const fetchReports = async () => {
    try {
      setLoading(true)
      
      // Start building the query
      let query = supabase
        .from('complaints')
        .select('*', { count: 'exact' })
      
      // Apply filters
      if (statusFilter !== "all") {
        query = query.eq('complaint_status', statusFilter)
      }
      
      if (priorityFilter !== "all") {
        query = query.eq('priority', priorityFilter)
      }
      
      if (searchQuery) {
        query = query.ilike('complaint_text', `%${searchQuery}%`)
      }
      
      // Apply sorting
      query = query.order(sortOrder.field, { ascending: sortOrder.direction === 'asc' })
      
      // Apply pagination
      const from = (currentPage - 1) * reportsPerPage
      const to = from + reportsPerPage - 1
      
      query = query.range(from, to)
      
      // Execute the query
      const { data, error, count } = await query
      
      if (error) {
        throw error
      }
      
      setReports(data || [])
      setTotalReports(count || 0)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field) => {
    setSortOrder({
      field,
      direction: 
        sortOrder.field === field && sortOrder.direction === 'desc' 
          ? 'asc' 
          : 'desc'
    })
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchReports()
  }

  const handleSelectReport = (id) => {
    router.push(`/reports/${id}`)
  }

  const getLocationAddress = (location) => {
    try {
      const locationObj = typeof location === 'string' ? JSON.parse(location) : location
      return locationObj?.address || 'Unknown Location'
    } catch (e) {
      return 'Invalid Location Data'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getTotalPages = () => {
    return Math.ceil(totalReports / reportsPerPage)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort('complaint_id')}
                    >
                      ID
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort('complaint_text')}
                    >
                      Description
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort('created_at')}
                    >
                      Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Evidence</TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort('priority')}
                    >
                      Priority
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort('complaint_status')}
                    >
                      Status
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      No reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow
                      key={report.complaint_id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSelectReport(report.complaint_id)}
                    >
                      <TableCell className="font-medium">
                        {report.complaint_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {report.complaint_text}
                      </TableCell>
                      <TableCell>
                        {getLocationAddress(report.location)}
                      </TableCell>
                      <TableCell>
                        {formatDate(report.created_at)}
                      </TableCell>
                      <TableCell>
                        {report.evidence_url ? (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-500 mr-2" />
                            <Badge
                              variant={report.evidence_status === 'reviewed' ? 'default' : 'outline'}
                            >
                              {report.evidence_status}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-gray-500">No evidence</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            report.priority === 'high'
                              ? 'bg-red-500'
                              : report.priority === 'medium'
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                          }
                        >
                          {report.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            report.complaint_status === 'accept'
                              ? 'bg-green-500'
                              : report.complaint_status === 'reject'
                                ? 'bg-red-500'
                                : 'bg-amber-500'
                          }
                        >
                          {report.complaint_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {!loading && totalReports > 0 && (
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {Math.min((currentPage - 1) * reportsPerPage + 1, totalReports)} to{' '}
                {Math.min(currentPage * reportsPerPage, totalReports)} of {totalReports} reports
              </div>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, getTotalPages()) }, (_, i) => {
                    const pageNumber = currentPage <= 3 
                      ? i + 1 
                      : currentPage + i - 2;
                      
                    if (pageNumber > getTotalPages()) return null;
                    
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNumber)}
                          isActive={currentPage === pageNumber}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, getTotalPages()))}
                      className={currentPage === getTotalPages() ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}