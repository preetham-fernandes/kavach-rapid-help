"use client"

import { useState, useEffect } from "react"
import { Bell, Search, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

export default function Header() {
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New emergency report submitted", time: "5 minutes ago" },
    { id: 2, message: "Evidence review requested", time: "30 minutes ago" },
    { id: 3, message: "Report #RPT-005 updated", time: "1 hour ago" },
  ])

  const [showNotificationBadge, setShowNotificationBadge] = useState(true)
  const { toast } = useToast()

  // Simulate new notification arriving
  useEffect(() => {
    const interval = setInterval(() => {
      const shouldAddNotification = Math.random() > 0.8

      if (shouldAddNotification) {
        const newNotification = {
          id: Date.now(),
          message: `New incident reported at ${new Date().toLocaleTimeString()}`,
          time: "Just now",
        }

        setNotifications((prev) => [newNotification, ...prev])
        setShowNotificationBadge(true)

        toast({
          title: "New Notification",
          description: newNotification.message,
          variant: "default",
        })
      }
    }, 45000)

    return () => clearInterval(interval)
  }, [toast])

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center md:w-72">
            <div className="block md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <div className="hidden md:block">
              <motion.h1
                className="text-xl font-bold text-primary"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                Law Enforcement Dashboard
              </motion.h1>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Search reports, evidence..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => setShowNotificationBadge(false)}
                >
                  <Bell className="h-5 w-5" />
                  <AnimatePresence>
                    {showNotificationBadge && (
                      <motion.span
                        className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      ></motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="py-2">
                    <div>
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

