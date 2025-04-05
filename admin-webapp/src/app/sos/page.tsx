"use client"

import { motion } from "framer-motion"
import Header from "@/components/header"
import SosCalls from "@/components/sos/sos-calls"
import SosCallDetail from "@/components/sos/sos-call-detail"
import { useState } from "react"
import { mockSosCalls } from "@/lib/mock-data"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function SosPage() {
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null)

  const selectedCall = selectedCallId ? mockSosCalls.find((call) => call.id === selectedCallId) : null

  return (
    <div className="min-h-screen">
      <Header />
      <motion.div className="container mx-auto px-4 py-6" initial="hidden" animate="show" variants={container}>
        <motion.h1 className="text-2xl font-bold text-gray-900 mb-6" variants={item}>
          SOS Emergency Calls
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div className="lg:col-span-1" variants={item}>
            <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-1.5 h-5 bg-red-500 rounded-full mr-2"></span>
                Active SOS Calls
              </h2>
              <SosCalls selectedCallId={selectedCallId} onSelectCall={setSelectedCallId} />
            </div>
          </motion.div>

          <motion.div className="lg:col-span-2" variants={item}>
            <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-100 h-full">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-1.5 h-5 bg-primary rounded-full mr-2"></span>
                Call Details
              </h2>
              <SosCallDetail call={selectedCall} />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

