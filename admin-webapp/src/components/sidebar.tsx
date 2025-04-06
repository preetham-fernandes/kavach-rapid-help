"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Map, FileText, Briefcase, Settings, LogOut, PhoneCall, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Map, label: "Incident Map", href: "/map" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: Briefcase, label: "Evidence", href: "/evidence" },
  { icon: PhoneCall, label: "SOS Calls", href: "/sos" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-[260px] bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 bg-primary">
          <div className="text-white font-bold text-xl flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6" />
            POLICE DEPT
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

            return (
              <motion.div
                key={item.href}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200",
                    isActive ? "bg-primary text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.label}</span>

                  {item.label === "SOS Calls"}
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-semibold">OP</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Officer Pandey</p>
              <p className="text-xs text-gray-400">Badge 43752</p>
            </div>
          </div>
          <button className="mt-4 flex items-center text-sm text-gray-300 hover:text-white w-full rounded-md px-4 py-2 hover:bg-gray-700 transition-colors">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

