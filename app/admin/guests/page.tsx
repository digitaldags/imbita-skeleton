/**
 * Guest list page for admin dashboard
 */

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import AdminLayout from '@/components/AdminLayout'
import GuestList from '@/components/GuestList'

/**
 * Check if user is authenticated as admin
 */
function isAuthenticated(): boolean {
  const cookieStore = cookies()
  return cookieStore.get('admin-authenticated')?.value === 'true'
}

export default async function GuestsPage() {
  if (!isAuthenticated()) {
    redirect('/admin')
  }

  return (
    <AdminLayout>
      <GuestList />
    </AdminLayout>
  )
}

