"use client"

import { motion } from "framer-motion"
import Header from "@/components/header"
import StatisticsCards from "@/components/dashboard/statistics-cards"
import IncidentFeed from "@/components/dashboard/incident-feed"
import DashboardMap from "@/components/dashboard/dashboard-map"
import SosCallsWidget from "@/components/dashboard/sos-calls-widget"

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

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <Header />
      <motion.div className="container mx-auto px-4 py-6" initial="hidden" animate="show" variants={container}>
        <motion.h1 className="text-2xl font-bold text-gray-900 mb-6" variants={item}>
          Dashboard Overview
        </motion.h1>

        <motion.div variants={item}>
          <StatisticsCards />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <motion.div className="lg:col-span-2" variants={item}>
            <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-1.5 h-5 bg-primary rounded-full mr-2"></span>
                Recent Incidents
              </h2>
              <IncidentFeed />
            </div>
          </motion.div>

          <motion.div className="lg:col-span-1" variants={item}>
            <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-1.5 h-5 bg-primary rounded-full mr-2"></span>
                Incident Map
              </h2>
              <DashboardMap />
            </div>
          </motion.div>
        </div>

        <motion.div className="mt-6" variants={item}>
          <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-1.5 h-5 bg-red-500 rounded-full mr-2"></span>
              SOS Calls
            </h2>
            <SosCallsWidget />
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

