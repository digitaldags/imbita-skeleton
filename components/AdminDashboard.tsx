/**
 * Admin dashboard component
 * Displays RSVP list and export functionality
 */

'use client'

import { useEffect, useState } from 'react'
import { deleteRSVP, getRSVPsPaginated, getAllRSVPsForExport, updateRSVP } from '@/app/actions/rsvps'
import type { AttendanceType, RSVP } from '@/lib/types'

type RSVPSortColumn = 'first_name' | 'last_name' | 'email' | 'attending' | 'attendance_type' | 'created_at' | 'updated_at'

interface EditState {
  id: string | null
  first_name: string
  last_name: string
  email: string
  attending: boolean
  attendance_type: AttendanceType
}

export default function AdminDashboard() {
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | AttendanceType>('all')
  const [editState, setEditState] = useState<EditState>({
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    attending: true,
    attendance_type: 'both',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isSendingAll, setIsSendingAll] = useState(false)
  const [isSendingOne, setIsSendingOne] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalFiltered, setTotalFiltered] = useState(0)
  const [totalAll, setTotalAll] = useState(0)
  const [totalAttending, setTotalAttending] = useState(0)
  const [totalNotAttending, setTotalNotAttending] = useState(0)
  const [totalChurch, setTotalChurch] = useState(0)
  const [totalReception, setTotalReception] = useState(0)
  const [totalBoth, setTotalBoth] = useState(0)
  const [sortColumn, setSortColumn] = useState<RSVPSortColumn>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const PAGE_SIZE = 15

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(0)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    loadRSVPs()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, attendanceFilter, sortColumn, sortDirection, debouncedSearch])

  const loadRSVPs = async () => {
    setIsLoading(true)
    setError(null)
    setActionMessage(null)
    try {
      const result = await getRSVPsPaginated(currentPage, PAGE_SIZE, attendanceFilter, sortColumn, sortDirection, debouncedSearch)
      setRsvps(result.data)
      setTotalFiltered(result.totalFiltered)
      setTotalAll(result.totalAll)
      setTotalAttending(result.totalAttending)
      setTotalNotAttending(result.totalNotAttending)
      setTotalChurch(result.totalChurch)
      setTotalReception(result.totalReception)
      setTotalBoth(result.totalBoth)
    } catch (err) {
      setError('Failed to load RSVPs')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (column: RSVPSortColumn) => {
    if (column === sortColumn) {
      setSortDirection((d: 'asc' | 'desc') => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
    setCurrentPage(0)
  }

  const startEdit = (rsvp: RSVP) => {
    setEditState({
      id: rsvp.id,
      first_name: rsvp.first_name,
      last_name: rsvp.last_name,
      email: rsvp.email,
      attending: rsvp.attending,
      attendance_type: rsvp.attendance_type,
    })
    setActionMessage(null)
  }

  const cancelEdit = () => {
    setEditState({
      id: null,
      first_name: '',
      last_name: '',
      email: '',
      attending: true,
      attendance_type: 'both',
    })
  }

  const saveEdit = async () => {
    if (!editState.id) return

    setIsSaving(true)
    setActionMessage(null)
    const result = await updateRSVP(editState.id, {
      first_name: editState.first_name,
      last_name: editState.last_name,
      email: editState.email,
      attending: editState.attending,
      attendance_type: editState.attendance_type,
    })
    setIsSaving(false)

    if (!result.success) {
      setActionMessage(result.error || 'Failed to update RSVP.')
      return
    }

    cancelEdit()
    setActionMessage('RSVP updated successfully.')
    await loadRSVPs()
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this RSVP? This action cannot be undone.'
    )
    if (!confirmed) return

    setIsDeleting(id)
    setActionMessage(null)
    const result = await deleteRSVP(id)
    setIsDeleting(null)

    if (!result.success) {
      setActionMessage(result.error || 'Failed to delete RSVP.')
      return
    }

    setActionMessage('RSVP deleted successfully.')
    if (rsvps.length === 1 && currentPage > 0) {
      setCurrentPage((p: number) => p - 1)
    } else {
      await loadRSVPs()
    }
  }

  const getAttendanceTypeLabel = (type: AttendanceType) => {
    switch (type) {
      case 'church':
        return 'Church Only'
      case 'reception':
        return 'Reception Only'
      case 'both':
        return 'Both'
      default:
        return 'Both'
    }
  }

  const handleExport = async () => {
    const allRsvps = await getAllRSVPsForExport(attendanceFilter)
    if (allRsvps.length === 0) return

    const headers = ['First Name', 'Last Name', 'Email', 'Attending', 'Attendance Type', 'Submitted At']
    const rows = allRsvps.map((rsvp) => [
      rsvp.first_name,
      rsvp.last_name,
      rsvp.email,
      rsvp.attending ? 'Yes' : 'No',
      getAttendanceTypeLabel(rsvp.attendance_type),
      new Date(rsvp.created_at).toLocaleString(),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rsvps-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleSendAll = async () => {
    const confirmed = window.confirm(
      'Send a reminder email to all attending guests who haven\'t received one yet?'
    )
    if (!confirmed) return

    setIsSendingAll(true)
    setActionMessage(null)
    try {
      const res = await fetch('/api/reminders/send', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        setActionMessage(json.error || 'Failed to send reminders.')
      } else {
        setActionMessage(json.message)
        await loadRSVPs()
      }
    } catch {
      setActionMessage('An unexpected error occurred while sending reminders.')
    } finally {
      setIsSendingAll(false)
    }
  }

  const handleSendOne = async (rsvp: RSVP) => {
    const label = rsvp.reminder_sent ? 'Resend' : 'Send'
    const confirmed = window.confirm(
      `${label} a reminder email to ${rsvp.first_name} ${rsvp.last_name} (${rsvp.email})?`
    )
    if (!confirmed) return

    setIsSendingOne(rsvp.id)
    setActionMessage(null)
    try {
      const res = await fetch(`/api/reminders/send/${rsvp.id}`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        setActionMessage(json.error || 'Failed to send reminder.')
      } else {
        setActionMessage(`Reminder sent to ${rsvp.first_name} ${rsvp.last_name}.`)
        await loadRSVPs()
      }
    } catch {
      setActionMessage('An unexpected error occurred while sending the reminder.')
    } finally {
      setIsSendingOne(null)
    }
  }


  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-serif text-wedding-maroon-dark">RSVP Responses</h1>
      </div>

      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="bg-wedding-beige-light p-4 rounded-lg flex-1 min-w-[200px]">
          <div className="text-sm text-wedding-maroon">Total RSVPs</div>
          <div className="text-2xl font-bold text-wedding-maroon-dark">{totalAll}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg flex-1 min-w-[200px]">
          <div className="text-sm text-green-700">Attending</div>
          <div className="text-2xl font-bold text-green-800">{totalAttending}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg flex-1 min-w-[200px]">
          <div className="text-sm text-red-700">Not Attending</div>
          <div className="text-2xl font-bold text-red-800">{totalNotAttending}</div>
        </div>
      </div>

      {/* Attendance Type Breakdown */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="bg-blue-50 p-4 rounded-lg flex-1 min-w-[200px]">
          <div className="text-sm text-blue-700">Church Only</div>
          <div className="text-2xl font-bold text-blue-800">{totalChurch}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg flex-1 min-w-[200px]">
          <div className="text-sm text-purple-700">Reception Only</div>
          <div className="text-2xl font-bold text-purple-800">{totalReception}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg flex-1 min-w-[200px]">
          <div className="text-sm text-yellow-700">Both Events</div>
          <div className="text-2xl font-bold text-yellow-800">{totalBoth}</div>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-wedding-maroon-dark">RSVP List</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
              className="pl-3 pr-8 py-2 border border-wedding-beige-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wedding-maroon focus:border-transparent bg-white text-wedding-maroon-dark"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-wedding-maroon/60 hover:text-wedding-maroon text-sm leading-none"
              >
                ✕
              </button>
            )}
          </div>
          <label className="text-sm text-wedding-maroon-dark">Filter:</label>
          <select
            value={attendanceFilter}
            onChange={(e) => {
              const newFilter = e.target.value as 'all' | AttendanceType
              setAttendanceFilter(newFilter)
              // Clear search when filter changes
              setSearchTerm('')
              setDebouncedSearch('')
              if (currentPage === 0) {
                // useEffect won't fire since currentPage didn't change; reload manually
                // loadRSVPs reads stale state via closure, so we pass values directly
                setIsLoading(true)
                setError(null)
                setActionMessage(null)
                getRSVPsPaginated(0, PAGE_SIZE, newFilter, sortColumn, sortDirection, '').then((result) => {
                  setRsvps(result.data)
                  setTotalFiltered(result.totalFiltered)
                  setTotalAll(result.totalAll)
                  setTotalAttending(result.totalAttending)
                  setTotalNotAttending(result.totalNotAttending)
                  setTotalChurch(result.totalChurch)
                  setTotalReception(result.totalReception)
                  setTotalBoth(result.totalBoth)
                }).catch((err) => {
                  setError('Failed to load RSVPs')
                  console.error(err)
                }).finally(() => {
                  setIsLoading(false)
                })
              } else {
                setCurrentPage(0)
              }
            }}
            className="px-3 py-2 border border-wedding-beige-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-maroon focus:border-transparent bg-white text-wedding-maroon-dark"
          >
            <option value="all">All Attendees</option>
            <option value="church">Church Only</option>
            <option value="reception">Reception Only</option>
            <option value="both">Both Events</option>
          </select>
          <button
            onClick={handleSendAll}
            disabled={isSendingAll || totalAttending === 0}
            className="bg-wedding-maroon text-white px-4 py-2 rounded-lg font-semibold hover:bg-wedding-maroon-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSendingAll ? 'Sending...' : 'Send All Reminders'}
          </button>
          <button
            onClick={handleExport}
            disabled={totalAll === 0}
            className="bg-wedding-maroon text-white px-4 py-2 rounded-lg font-semibold hover:bg-wedding-maroon-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-4 p-3 bg-wedding-beige-light text-wedding-maroon-dark border border-wedding-beige-dark rounded-lg">
          {actionMessage}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-wedding-maroon">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : totalAll === 0 ? (
        <div className="text-center py-8 text-wedding-maroon">No RSVPs yet.</div>
      ) : rsvps.length === 0 && debouncedSearch ? (
        <div className="text-center py-8 text-wedding-maroon">No RSVPs match your search.</div>
      ) : rsvps.length === 0 ? (
        <div className="text-center py-8 text-wedding-maroon">No RSVPs match the selected filter.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-wedding-beige">
                <th
                  onClick={() => handleSort('first_name')}
                  className="border border-wedding-beige-dark px-4 py-2 text-left text-wedding-maroon-dark cursor-pointer select-none hover:bg-wedding-beige whitespace-nowrap"
                >
                  First Name{' '}
                  <span className="text-xs">{sortColumn === 'first_name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
                </th>
                <th
                  onClick={() => handleSort('last_name')}
                  className="border border-wedding-beige-dark px-4 py-2 text-left text-wedding-maroon-dark cursor-pointer select-none hover:bg-wedding-beige whitespace-nowrap"
                >
                  Last Name{' '}
                  <span className="text-xs">{sortColumn === 'last_name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
                </th>
                <th
                  onClick={() => handleSort('email')}
                  className="border border-wedding-beige-dark px-4 py-2 text-left text-wedding-maroon-dark cursor-pointer select-none hover:bg-wedding-beige whitespace-nowrap"
                >
                  Email{' '}
                  <span className="text-xs">{sortColumn === 'email' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
                </th>
                <th
                  onClick={() => handleSort('attending')}
                  className="border border-wedding-beige-dark px-4 py-2 text-left text-wedding-maroon-dark cursor-pointer select-none hover:bg-wedding-beige whitespace-nowrap"
                >
                  Attending{' '}
                  <span className="text-xs">{sortColumn === 'attending' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
                </th>
                <th
                  onClick={() => handleSort('attendance_type')}
                  className="border border-wedding-beige-dark px-4 py-2 text-left text-wedding-maroon-dark cursor-pointer select-none hover:bg-wedding-beige whitespace-nowrap"
                >
                  Attendance Type{' '}
                  <span className="text-xs">{sortColumn === 'attendance_type' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
                </th>
                <th
                  onClick={() => handleSort('created_at')}
                  className="border border-wedding-beige-dark px-4 py-2 text-left text-wedding-maroon-dark cursor-pointer select-none hover:bg-wedding-beige whitespace-nowrap"
                >
                  Submitted{' '}
                  <span className="text-xs">{sortColumn === 'created_at' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
                </th>
                <th
                  onClick={() => handleSort('updated_at')}
                  className="border border-wedding-beige-dark px-4 py-2 text-left text-wedding-maroon-dark cursor-pointer select-none hover:bg-wedding-beige whitespace-nowrap"
                >
                  Updated{' '}
                  <span className="text-xs">{sortColumn === 'updated_at' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
                </th>
                <th className="border border-wedding-beige-dark px-4 py-2 text-left text-wedding-maroon-dark">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map((rsvp) => (
                <tr key={rsvp.id} className="hover:bg-wedding-beige-light">
                  <td className="border border-wedding-beige-dark px-4 py-2 text-wedding-maroon">
                    {editState.id === rsvp.id ? (
                      <input
                        type="text"
                        value={editState.first_name}
                        onChange={(e) =>
                          setEditState((prev) => ({
                            ...prev,
                            first_name: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1 border border-wedding-beige-dark rounded-md focus:outline-none focus:ring-2 focus:ring-wedding-maroon focus:border-transparent"
                      />
                    ) : (
                      rsvp.first_name
                    )}
                  </td>
                  <td className="border border-wedding-beige-dark px-4 py-2 text-wedding-maroon">
                    {editState.id === rsvp.id ? (
                      <input
                        type="text"
                        value={editState.last_name}
                        onChange={(e) =>
                          setEditState((prev) => ({
                            ...prev,
                            last_name: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1 border border-wedding-beige-dark rounded-md focus:outline-none focus:ring-2 focus:ring-wedding-maroon focus:border-transparent"
                      />
                    ) : (
                      rsvp.last_name
                    )}
                  </td>
                  <td className="border border-wedding-beige-dark px-4 py-2 text-wedding-maroon">
                    {editState.id === rsvp.id ? (
                      <input
                        type="email"
                        value={editState.email}
                        onChange={(e) =>
                          setEditState((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1 border border-wedding-beige-dark rounded-md focus:outline-none focus:ring-2 focus:ring-wedding-maroon focus:border-transparent"
                      />
                    ) : (
                      rsvp.email
                    )}
                  </td>
                  <td className="border border-wedding-beige-dark px-4 py-2 text-wedding-maroon">
                    {editState.id === rsvp.id ? (
                      <select
                        value={editState.attending ? 'yes' : 'no'}
                        onChange={(e) =>
                          setEditState((prev) => ({
                            ...prev,
                            attending: e.target.value === 'yes',
                          }))
                        }
                        className="px-2 py-1 border border-wedding-beige-dark rounded-md focus:outline-none focus:ring-2 focus:ring-wedding-maroon focus:border-transparent bg-white"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    ) : rsvp.attending ? (
                      <span className="text-green-700 font-semibold">Yes</span>
                    ) : (
                      <span className="text-red-700 font-semibold">No</span>
                    )}
                  </td>
                  <td className="border border-wedding-beige-dark px-4 py-2 text-wedding-maroon">
                    {editState.id === rsvp.id ? (
                      <select
                        value={editState.attendance_type}
                        onChange={(e) =>
                          setEditState((prev) => ({
                            ...prev,
                            attendance_type: e.target.value as AttendanceType,
                          }))
                        }
                        disabled={!editState.attending}
                        className="px-2 py-1 border border-wedding-beige-dark rounded-md focus:outline-none focus:ring-2 focus:ring-wedding-maroon focus:border-transparent bg-white disabled:opacity-50"
                      >
                        <option value="both">Both</option>
                        <option value="church">Church Only</option>
                        <option value="reception">Reception Only</option>
                      </select>
                    ) : rsvp.attending ? (
                      <span className="text-wedding-maroon-dark">{getAttendanceTypeLabel(rsvp.attendance_type)}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="border border-wedding-beige-dark px-4 py-2 text-wedding-maroon">
                    {new Date(rsvp.created_at).toLocaleString()}
                  </td>
                  <td className="border border-wedding-beige-dark px-4 py-2 text-wedding-maroon">
                    {rsvp.updated_at
                      ? new Date(rsvp.updated_at).toLocaleString()
                      : '—'}
                  </td>
                  <td className="border border-wedding-beige-dark px-4 py-2 text-wedding-maroon">
                    {editState.id === rsvp.id ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveEdit}
                          disabled={isSaving}
                          className="px-3 py-1 text-sm rounded-md bg-wedding-maroon text-white hover:bg-wedding-maroon-dark disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-3 py-1 text-sm rounded-md border border-wedding-beige-dark text-wedding-maroon hover:bg-wedding-beige-light"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => startEdit(rsvp)}
                          className="px-3 py-1 text-sm rounded-md border border-wedding-beige-dark text-wedding-maroon hover:bg-wedding-beige-light"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(rsvp.id)}
                          disabled={isDeleting === rsvp.id}
                          className="px-3 py-1 text-sm rounded-md border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting === rsvp.id ? 'Deleting...' : 'Delete'}
                        </button>
                        {rsvp.attending && (
                          <button
                            type="button"
                            onClick={() => handleSendOne(rsvp)}
                            disabled={isSendingOne === rsvp.id}
                            title={rsvp.reminder_sent && rsvp.reminder_sent_at
                              ? `Reminder sent ${new Date(rsvp.reminder_sent_at).toLocaleString()}`
                              : 'Send reminder email'}
                            className={`px-3 py-1 text-sm rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              rsvp.reminder_sent
                                ? 'border-green-300 text-green-700 hover:bg-green-50'
                                : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                            }`}
                          >
                            {isSendingOne === rsvp.id
                              ? 'Sending...'
                              : rsvp.reminder_sent
                                ? '✓ Resend'
                                : 'Send'}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      {!isLoading && !error && totalAll > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-wedding-maroon">
            Showing {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, totalFiltered)} of {totalFiltered} RSVP{totalFiltered !== 1 ? 's' : ''}
            {attendanceFilter !== 'all' && ` (filtered from ${totalAll} total)`}
          </p>
          <div className="flex items-center gap-3">
            {editState.id && (
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-md">
                Save or cancel your edit before changing pages.
              </span>
            )}
            <button
              type="button"
              onClick={() => setCurrentPage((p: number) => p - 1)}
              disabled={currentPage === 0 || isLoading || !!editState.id}
              className="px-4 py-2 text-sm rounded-lg border border-wedding-beige-dark text-wedding-maroon hover:bg-wedding-beige-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
            >
              ← Previous
            </button>
            <span className="text-sm text-wedding-maroon-dark font-medium">
              Page {currentPage + 1} of {Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE))}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p: number) => p + 1)}
              disabled={(currentPage + 1) * PAGE_SIZE >= totalFiltered || isLoading || !!editState.id}
              className="px-4 py-2 text-sm rounded-lg border border-wedding-beige-dark text-wedding-maroon hover:bg-wedding-beige-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
