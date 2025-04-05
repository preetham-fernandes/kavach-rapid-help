"use client"

import { AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import CountUp from "react-countup"

const stats = [
  {
    title: "Total Reports",
    value: 248,
    icon: FileText,
    color: "bg-blue-500",
    change: "+12% from last month",
  },
  {
    title: "Resolved Cases",
    value: 187,
    icon: CheckCircle,
    color: "bg-green-500",
    change: "+8% from last month",
  },
  {
    title: "Pending Verification",
    value: 42,
    icon: Clock,
    color: "bg-amber-500",
    change: "-5% from last month",
  },
  {
    title: "Emergency Situations",
    value: 19,
    icon: AlertTriangle,
    color: "bg-primary",
    change: "+2 new today",
  },
]

export default function StatisticsCards() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [statValues, setStatValues] = useState(stats.map((stat) => stat.value))

  // Simulate changing statistics
  useEffect(() => {
    const interval = setInterval(() => {
      setStatValues((prev) =>
        prev.map((value, index) => {
          // Random small fluctuation
          const change = Math.floor(Math.random() * 5) - 2
          return Math.max(0, value + change)
        }),
      )
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          className="bg-white rounded-lg shadow-lg p-6 border border-gray-100 relative overflow-hidden"
          whileHover={{
            scale: 1.03,
            transition: { duration: 0.2 },
          }}
          onHoverStart={() => setHoveredIndex(index)}
          onHoverEnd={() => setHoveredIndex(null)}
        >
          {/* Background pattern */}
          <div className="absolute -right-6 -bottom-6 opacity-5">
            <stat.icon className="h-32 w-32" />
          </div>

          <div className="flex items-center">
            <div className={`p-3 rounded-full ${stat.color} text-white`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">
                <CountUp end={statValues[index]} duration={2} separator="," />
              </h3>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">{stat.change}</p>

          {/* Animated indicator when hovered */}
          {hoveredIndex === index && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-primary"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.div>
      ))}
    </div>
  )
}

