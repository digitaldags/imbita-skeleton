/**
 * Unit tests for RSVP API route
 */

import { POST } from '@/app/api/rsvp/route'
import { supabase } from '@/lib/supabase'
import { NextRequest } from 'next/server'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

describe('POST /api/rsvp', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 for missing required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({ name: '', email: '' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Name and email are required')
  })

  it('returns 400 for invalid email format', async () => {
    const request = new NextRequest('http://localhost:3000/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({ name: 'John Doe', email: 'invalid-email' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid email format')
  })

  it('creates RSVP successfully', async () => {
    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            attending: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          error: null,
        }),
      }),
    })

    ;(supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    })

    const request = new NextRequest('http://localhost:3000/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        attending: true,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toBe('RSVP submitted successfully')
    expect(mockInsert).toHaveBeenCalledWith([
      {
        name: 'John Doe',
        email: 'john@example.com',
        attending: true,
      },
    ])
  })

  it('handles database errors', async () => {
    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }),
    })

    ;(supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    })

    const request = new NextRequest('http://localhost:3000/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        attending: true,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to save RSVP. Please try again.')
  })
})

