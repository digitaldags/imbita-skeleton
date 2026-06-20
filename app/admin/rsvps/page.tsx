/**
 * RSVP list page for admin dashboard
 */

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import AdminLayout from '@/components/AdminLayout'
import AdminDashboard from '@/components/AdminDashboard'

/**
 * Check if user is authenticated as admin
 */
function isAuthenticated(): boolean {
  const cookieStore = cookies()
  return cookieStore.get('admin-authenticated')?.value === 'true'
}

export default async function RSVPsPage() {
  if (!isAuthenticated()) {
    redirect('/admin')
  }

  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  )
}

