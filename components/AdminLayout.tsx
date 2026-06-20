/**
 * Admin layout component with sidebar navigation
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAdmin } from '@/app/actions/admin'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
 
  const handleLogout = async () => {
    await logoutAdmin()
  }

  return (
    <div className="min-h-screen flex bg-wedding-beige-light">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 h-full flex flex-col">
          <div className="mb-8">
            <h1 className="text-2xl font-serif text-wedding-maroon-dark">Admin</h1>
          </div>

          <nav className="space-y-2">
            <Link
              href="/admin/rsvps"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/rsvps' || pathname === '/admin'
                  ? 'bg-wedding-maroon text-white'
                  : 'text-wedding-maroon-dark hover:bg-wedding-beige-light'
              }`}
            >
              RSVP List
            </Link>
            <Link
              href="/admin/guests"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/guests'
                  ? 'bg-wedding-maroon text-white'
                  : 'text-wedding-maroon-dark hover:bg-wedding-beige-light'
              }`}
            >
              Guest List
            </Link>
          </nav>

          <div className="mt-auto pt-8 border-t border-wedding-beige-dark">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-wedding-maroon hover:bg-wedding-beige-light rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-4 py-12">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}

