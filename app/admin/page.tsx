/**
 * Admin dashboard page with password protection
 * Redirects to RSVPs page after login
 */

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

/**
 * Check if user is authenticated as admin
 */
function isAuthenticated(): boolean {
  const cookieStore = cookies()
  return cookieStore.get('admin-authenticated')?.value === 'true'
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  // If not authenticated, show login form
  if (!isAuthenticated()) {
    return <AdminLogin error={searchParams.error === 'invalid'} />
  }

  // If authenticated, redirect to RSVPs page
  redirect('/admin/rsvps')
}

/**
 * Admin login component
 */
function AdminLogin({ error }: { error: boolean }) {
  async function handleLogin(formData: FormData) {
    'use server'
    const { verifyAdminPassword } = await import('@/app/actions/admin')
    const password = formData.get('password') as string

    if (await verifyAdminPassword(password)) {
      const cookieStore = cookies()
      cookieStore.set('admin-authenticated', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
      })
      redirect('/admin/rsvps')
    } else {
      redirect('/admin?error=invalid')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-serif text-wedding-maroon-dark mb-6 text-center">
            Admin Login
          </h1>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg">
              Invalid password. Please try again.
            </div>
          )}
          <form action={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-wedding-maroon-dark mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="w-full px-4 py-2 border border-wedding-beige-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-maroon focus:border-transparent"
                placeholder="Enter admin password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-wedding-maroon text-white px-6 py-3 rounded-lg font-semibold hover:bg-wedding-maroon-dark transition-colors duration-200"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
