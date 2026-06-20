/**
 * Server actions for admin authentication
 */

'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Verify admin password
 * @param password - Password to verify
 * @returns true if password is correct, false otherwise
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin'
  return password === adminPassword
}

/**
 * Log out the admin by clearing the auth cookie.
 * Uses a server action so it can actually remove the httpOnly cookie.
 */
export async function logoutAdmin() {
  const cookieStore = cookies()

  // Clear the cookie by setting maxAge to 0
  cookieStore.set('admin-authenticated', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  redirect('/admin')
}

