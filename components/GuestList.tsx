/**
 * Guest List component for managing pre-approved guests
 * Displays guest list with CRUD functionality
 */

'use client'

import { useEffect, useState, FormEvent, ChangeEvent } from 'react'
import {
  createGuest,
  deleteGuest,
  getGuestsPaginated,
  getAllGuestsForExport,
  updateGuest,
  importGuestsFromCSV,
} from '@/app/actions/guests'
import type { Guest } from '@/lib/types'

type GuestSortColumn = 'first_name' | 'last_name' | 'enabled' | 'is_inc' | 'created_at' | 'updated_at'

interface EditState {
  id: string | null
  first_name: string
  last_name: string
  enabled: boolean
  is_inc: boolean
}

export default function GuestList() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>({
    id: null,
    first_name: '',
    last_name: '',
    enabled: true,
    is_inc: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newGuest, setNewGuest] = useState({ first_name: '', last_name: '' })
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    imported: number
    skipped: number
    errors: string[]
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [totalEnabled, setTotalEnabled] = useState(0)
  const [totalDisabled, setTotalDisabled] = useState(0)
  const [sortColumn, setSortColumn] = useState<GuestSortColumn>('created_at')
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
    loadGuests()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortColumn, sortDirection, debouncedSearch])

  const loadGuests = async () => {
    setIsLoading(true)
    setError(null)
    setActionMessage(null)
    try {
      const result = await getGuestsPaginated(currentPage, PAGE_SIZE, sortColumn, sortDirection, debouncedSearch)
      setGuests(result.data)
      setTotalCount(result.total)
      setTotalEnabled(result.totalEnabled)
      setTotalDisabled(result.totalDisabled)
    } catch (err) {
      setError('Failed to load guests')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (column: GuestSortColumn) => {
    if (column === sortColumn) {
      setSortDirection((d: 'asc' | 'desc') => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
    setCurrentPage(0)
  }

  const startEdit = (guest: Guest) => {
    setEditState({
      id: guest.id,
      first_name: guest.first_name,
      last_name: guest.last_name,
      enabled: guest.enabled,
      is_inc: guest.is_inc,
    })
    setActionMessage(null)
  }

  const cancelEdit = () => {
    setEditState({
      id: null,
      first_name: '',
      last_name: '',
      enabled: true,
      is_inc: false,
    })
  }

  const saveEdit = async () => {
    if (!editState.id) return

    setIsSaving(true)
    setActionMessage(null)
    const result = await updateGuest(editState.id, {
      first_name: editState.first_name,
      last_name: editState.last_name,
      enabled: editState.enabled,
      is_inc: editState.is_inc,
    })
    setIsSaving(false)

    if (!result.success) {
      setActionMessage(result.error || 'Failed to update guest.')
      return
    }

    cancelEdit()
    setActionMessage('Guest updated successfully.')
    await loadGuests()
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this guest? This action cannot be undone.'
    )
    if (!confirmed) return

    setIsDeleting(id)
    setActionMessage(null)
    const result = await deleteGuest(id)
    setIsDeleting(null)

    if (!result.success) {
      setActionMessage(result.error || 'Failed to delete guest.')
      return
    }

    setActionMessage('Guest deleted successfully.')
    // If we deleted the last row on a non-first page, step back one page.
    // The useEffect will fire and reload; otherwise reload current page manually.
    if (guests.length === 1 && currentPage > 0) {
      setCurrentPage((p: number) => p - 1)
    } else {
      await loadGuests()
    }
  }

  const handleOpenAddModal = () => {
    setNewGuest({ first_name: '', last_name: '' })
    setAddError(null)
    setIsAddModalOpen(true)
  }

  const handleAddGuest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsCreating(true)
    setAddError(null)

    const result = await createGuest(newGuest.first_name, newGuest.last_name)
    setIsCreating(false)

    if (!result.success) {
      setAddError(result.error || 'Failed to add guest.')
      return
    }

    setIsAddModalOpen(false)
    setActionMessage('Guest added successfully.')
    // Navigate to page 0 so the new guest (ordered by created_at DESC) is visible.
    // If already on page 0, manually reload since setCurrentPage won't trigger the effect.
    if (currentPage === 0) {
      await loadGuests()
    } else {
      setCurrentPage(0)
    }
  }

  const handleExport = async () => {
    const allGuests = await getAllGuestsForExport()
    if (allGuests.length === 0) return

    const headers = ['First Name', 'Last Name', 'Enabled', 'INC Member', 'Created At', 'Updated At']
    const rows = allGuests.map((guest) => [
      guest.first_name,
      guest.last_name,
      guest.enabled ? 'Yes' : 'No',
      guest.is_inc ? 'Yes' : 'No',
      new Date(guest.created_at).toLocaleString(),
      guest.updated_at ? new Date(guest.updated_at).toLocaleString() : '—',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `guest-list-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleImportCSV = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setImportResult({
        imported: 0,
        skipped: 0,
        errors: ['Please upload a CSV file.'],
      })
      return
    }

    setIsImporting(true)
    setImportResult(null)

    try {
      const csvData = await file.text()
      const result = await importGuestsFromCSV(csvData)
      setImportResult(result)
      
      if (result.imported > 0) {
        setActionMessage(`Successfully imported ${result.imported} guest(s).`)
        if (currentPage === 0) {
          await loadGuests()
        } else {
          setCurrentPage(0)
        }
      }
    } catch (error) {
      console.error('Error reading CSV:', error)
      setImportResult({
        imported: 0,
        skipped: 0,
        errors: ['Failed to read CSV file.'],
      })
    } finally {
      setIsImporting(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleOpenImportModal = () => {
    setImportResult(null)
    setIsImportModalOpen(true)
  }


  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="mb-4 flex flex-wrap gap-3 justify-between items-center">
        <h2 className="text-xl font-semibold text-wedding-maroon-dark">Guest List</h2>
        <div className="flex flex-wrap gap-2 items-center">
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
          <button
            onClick={handleOpenAddModal}
            className="bg-wedding-maroon text-white px-4 py-2 rounded-lg font-semibold hover:bg-wedding-maroon-dark transition-colors duration-200"
          >
            Add Guest
          </button>
          <button
            onClick={handleOpenImportModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Import CSV
          </button>
          <button
            onClick={handleExport}
            disabled={totalCount === 0}
            className="bg-wedding-maroon/80 text-white px-4 py-2 rounded-lg font-semibold hover:bg-wedding-maroon transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Count Cards */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="bg-wedding-beige p-4 rounded-lg flex-1 min-w-[200px]">
          <div className="text-sm text-wedding-maroon-dark">Total Guests</div>
          <div className="text-2xl font-bold text-wedding-maroon-dark">{totalCount}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg flex-1 min-w-[200px]">
          <div className="text-sm text-green-700">Enabled</div>
          <div className="text-2xl font-bold text-green-800">{totalEnabled}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg flex-1 min-w-[200px]">
          <div className="text-sm text-red-700">Disabled</div>
          <div className="text-2xl font-bold text-red-800">{totalDisabled}</div>
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
      ) : guests.length === 0 && !debouncedSearch ? (
        <div className="text-center py-8 text-wedding-maroon">No guests yet.</div>
      ) : guests.length === 0 ? (
        <div className="text-center py-8 text-wedding-maroon">No guests match your search.</div>
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
                  onClick={() => handleSort('enabled')}
                  className="border border-wedding-beige-dark px-4 py-2 text-left text-wedding-maroon-dark cursor-pointer select-none hover:bg-wedding-beige whitespace-nowrap"
                >
                  Status{' '}
                  <span className="text-xs">{sortColumn === 'enabled' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
                </th>
                <th
                  onClick={() => handleSort('is_inc')}
                  className="border border-wedding-beige-dark px-4 py-2 text-left text-wedding-maroon-dark cursor-pointer select-none hover:bg-wedding-beige whitespace-nowrap"
                >
                  INC Member{' '}
                  <span className="text-xs">{sortColumn === 'is_inc' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
                </th>
                <th
                  onClick={() => handleSort('created_at')}
                  className="border border-wedding-beige-dark px-4 py-2 text-left text-wedding-maroon-dark cursor-pointer select-none hover:bg-wedding-beige whitespace-nowrap"
                >
                  Created{' '}
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
              {guests.map((guest) => (
                <tr key={guest.id} className="hover:bg-wedding-beige-light">
                  <td className="border border-wedding-beige-dark px-4 py-2 text-wedding-maroon">
                    {editState.id === guest.id ? (
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
                      guest.first_name
                    )}
                  </td>
                  <td className="border border-wedding-beige-dark px-4 py-2 text-wedding-maroon">
                    {editState.id === guest.id ? (
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
                      guest.last_name
                    )}
                  </td>
                  <td className="border border-wedding-beige-dark px-4 py-2 text-wedding-maroon">
                    {editState.id === guest.id ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editState.enabled}
                          onChange={(e) =>
                            setEditState((prev) => ({
                              ...prev,
                              enabled: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 text-wedding-maroon focus:ring-wedding-maroon border-wedding-beige-dark rounded"
                        />
                        <span className="text-sm">
                          {editState.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </label>
                    ) : (
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          guest.enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {guest.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    )}
                  </td>
                  <td className="border border-wedding-beige-dark px-4 py-2 text-wedding-maroon">
                    {editState.id === guest.id ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editState.is_inc}
                          onChange={(e) =>
                            setEditState((prev) => ({
                              ...prev,
                              is_inc: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 text-wedding-maroon focus:ring-wedding-maroon border-wedding-beige-dark rounded"
                        />
                        <span className="text-sm">
                          {editState.is_inc ? 'Yes' : 'No'}
                        </span>
                      </label>
                    ) : (
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          guest.is_inc
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {guest.is_inc ? 'Yes' : 'No'}
                      </span>
                    )}
                  </td>
                  <td className="border border-wedding-beige-dark px-4 py-2 text-wedding-maroon">
                    {new Date(guest.created_at).toLocaleString()}
                  </td>
                  <td className="border border-wedding-beige-dark px-4 py-2 text-wedding-maroon">
                    {guest.updated_at
                      ? new Date(guest.updated_at).toLocaleString()
                      : '—'}
                  </td>
                  <td className="border border-wedding-beige-dark px-4 py-2 text-wedding-maroon">
                    {editState.id === guest.id ? (
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
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(guest)}
                          className="px-3 py-1 text-sm rounded-md border border-wedding-beige-dark text-wedding-maroon hover:bg-wedding-beige-light"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(guest.id)}
                          disabled={isDeleting === guest.id}
                          className="px-3 py-1 text-sm rounded-md border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting === guest.id ? 'Deleting...' : 'Delete'}
                        </button>
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
      {!isLoading && !error && totalCount > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-wedding-maroon">
            Showing {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, totalCount)} of {totalCount} guest{totalCount !== 1 ? 's' : ''}
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
              Page {currentPage + 1} of {Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p: number) => p + 1)}
              disabled={(currentPage + 1) * PAGE_SIZE >= totalCount || isLoading || !!editState.id}
              className="px-4 py-2 text-sm rounded-lg border border-wedding-beige-dark text-wedding-maroon hover:bg-wedding-beige-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Add guest modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="mb-4">
              <h3 className="text-2xl font-serif text-wedding-maroon-dark">
                Add Guest
              </h3>
              <p className="text-sm text-wedding-maroon">
                Add a pre-approved guest to the list.
              </p>
            </div>
            <form onSubmit={handleAddGuest} className="space-y-4">
              <div>
                <label
                  htmlFor="new_first_name"
                  className="block text-sm font-medium text-wedding-maroon-dark mb-2"
                >
                  First Name *
                </label>
                <input
                  id="new_first_name"
                  type="text"
                  required
                  value={newGuest.first_name}
                  onChange={(e) =>
                    setNewGuest((prev) => ({ ...prev, first_name: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-wedding-beige-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-maroon focus:border-transparent"
                  placeholder="First name"
                />
              </div>
              <div>
                <label
                  htmlFor="new_last_name"
                  className="block text-sm font-medium text-wedding-maroon-dark mb-2"
                >
                  Last Name *
                </label>
                <input
                  id="new_last_name"
                  type="text"
                  required
                  value={newGuest.last_name}
                  onChange={(e) =>
                    setNewGuest((prev) => ({ ...prev, last_name: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-wedding-beige-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-maroon focus:border-transparent"
                  placeholder="Last name"
                />
              </div>

              {addError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800">
                  {addError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 bg-wedding-maroon text-white px-4 py-2 rounded-lg font-semibold hover:bg-wedding-maroon-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Adding...' : 'Add Guest'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 border border-wedding-beige-dark text-wedding-maroon px-4 py-2 rounded-lg font-semibold hover:bg-wedding-beige-light transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="mb-4">
              <h3 className="text-2xl font-serif text-wedding-maroon-dark">
                Import Guests from CSV
              </h3>
              <p className="text-sm text-wedding-maroon mt-2">
                Upload a CSV file with columns: <strong>first_name, last_name</strong>
              </p>
              <p className="text-xs text-wedding-maroon/70 mt-1">
                Existing guests will be skipped. All imported guests will be enabled by default.
              </p>
            </div>

            <div className="mb-4">
              <label
                htmlFor="csv_file"
                className="block text-sm font-medium text-wedding-maroon-dark mb-2"
              >
                Select CSV File
              </label>
              <input
                id="csv_file"
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                disabled={isImporting}
                className="w-full px-4 py-2 border border-wedding-beige-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-maroon focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {isImporting && (
              <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">
                Processing CSV file...
              </div>
            )}

            {importResult && (
              <div className="mb-4 space-y-2">
                <div
                  className={`p-3 rounded-lg border ${
                    importResult.imported > 0
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  }`}
                >
                  <p className="font-semibold">Import Results:</p>
                  <p className="text-sm">
                    Imported: {importResult.imported} | Skipped: {importResult.skipped}
                  </p>
                </div>
                {importResult.errors.length > 0 && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 max-h-40 overflow-y-auto">
                    <p className="font-semibold text-sm mb-1">Errors:</p>
                    <ul className="text-xs list-disc list-inside space-y-1">
                      {importResult.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="flex-1 border border-wedding-beige-dark text-wedding-maroon px-4 py-2 rounded-lg font-semibold hover:bg-wedding-beige-light transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

