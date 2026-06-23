import { submitRSVP } from '@/app/actions/rsvp'
import { supabaseAdmin } from '@/lib/supabase'
import { checkGuestExists } from '@/app/actions/guests'
import { generateConfirmationToken } from '@/lib/confirmation'

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: { from: jest.fn() },
}))
jest.mock('@/app/actions/guests')
jest.mock('@/lib/confirmation')

const mockFrom = supabaseAdmin.from as jest.Mock
const mockCheckGuestExists = checkGuestExists as jest.MockedFunction<typeof checkGuestExists>
const mockGenerateToken = generateConfirmationToken as jest.MockedFunction<typeof generateConfirmationToken>

function mockNoExistingRSVP() {
  mockFrom.mockReturnValueOnce({
    select: () => ({
      ilike: () => ({
        ilike: () => ({
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    }),
  })
}

const validFormData = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  attending: true,
  attendance_type: 'both' as const,
}

describe('submitRSVP', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('validates required fields', async () => {
    const result = await submitRSVP({
      ...validFormData,
      first_name: '',
      last_name: '',
      email: '',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('First name, last name, and email are required')
  })

  it('validates email format', async () => {
    mockNoExistingRSVP()

    const result = await submitRSVP({ ...validFormData, email: 'invalid-email' })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid email format')
  })

  it('submits valid RSVP', async () => {
    mockNoExistingRSVP()
    mockCheckGuestExists.mockResolvedValue(true)
    mockGenerateToken.mockReturnValue('test-token')

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: '1', ...validFormData },
          error: null,
        }),
      }),
    })
    mockFrom.mockReturnValueOnce({ insert: mockInsert })

    const result = await submitRSVP(validFormData)

    expect(result.success).toBe(true)
    expect(result.token).toBe('test-token')
    expect(mockInsert).toHaveBeenCalledWith({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      attending: true,
      attendance_type: 'both',
    })
  })

  it('handles database errors', async () => {
    mockNoExistingRSVP()
    mockCheckGuestExists.mockResolvedValue(true)

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }),
    })
    mockFrom.mockReturnValueOnce({ insert: mockInsert })

    const result = await submitRSVP(validFormData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Failed to save RSVP. Please try again.')
  })
})
