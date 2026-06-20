/**
 * Unit tests for RSVP form validation
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RSVPForm from '@/components/RSVPForm'
import { submitRSVP } from '@/app/actions/rsvp'

// Mock the server action
jest.mock('@/app/actions/rsvp')

describe('RSVPForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    render(<RSVPForm />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/will you be attending/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit rsvp/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<RSVPForm />)

    const submitButton = screen.getByRole('button', { name: /submit rsvp/i })
    await user.click(submitButton)

    // HTML5 validation should prevent submission
    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement

    expect(nameInput.validity.valueMissing).toBe(true)
    expect(emailInput.validity.valueMissing).toBe(true)
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockSubmitRSVP = submitRSVP as jest.MockedFunction<typeof submitRSVP>
    mockSubmitRSVP.mockResolvedValue({
      success: true,
      data: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        attending: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    })

    render(<RSVPForm />)

    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /submit rsvp/i }))

    await waitFor(() => {
      expect(mockSubmitRSVP).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        attending: true,
      })
    })

    await waitFor(() => {
      expect(screen.getByText(/thank you/i)).toBeInTheDocument()
    })
  })

  it('displays error message on submission failure', async () => {
    const user = userEvent.setup()
    const mockSubmitRSVP = submitRSVP as jest.MockedFunction<typeof submitRSVP>
    mockSubmitRSVP.mockResolvedValue({
      success: false,
      error: 'Invalid email format',
    })

    render(<RSVPForm />)

    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'invalid-email')
    await user.click(screen.getByRole('button', { name: /submit rsvp/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })
  })

  it('allows selecting attending status', async () => {
    const user = userEvent.setup()
    render(<RSVPForm />)

    const notAttendingRadio = screen.getByLabelText(/sorry, i can't make it/i)
    await user.click(notAttendingRadio)

    expect(notAttendingRadio).toBeChecked()
  })
})

