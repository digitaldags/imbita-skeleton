/**
 * Unit tests for RSVP server actions
 */

import { submitRSVP } from '@/app/actions/rsvp'
import { supabase } from '@/lib/supabase'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

describe('submitRSVP', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('validates required fields', async () => {
    const result = await submitRSVP({
      name: '',
      email: '',
      attending: true,
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Name and email are required')
  })

  it('validates email format', async () => {
    const result = await submitRSVP({
      name: 'John Doe',
      email: 'invalid-email',
      attending: true,
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid email format')
  })

  it('submits valid RSVP', async () => {
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

    const result = await submitRSVP({
      name: 'John Doe',
      email: 'john@example.com',
      attending: true,
    })

    expect(result.success).toBe(true)
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

    const result = await submitRSVP({
      name: 'John Doe',
      email: 'john@example.com',
      attending: true,
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Failed to save RSVP. Please try again.')
  })
})

