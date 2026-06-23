import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RSVPForm from '@/components/RSVPForm'
import { submitRSVP } from '@/app/actions/rsvp'

jest.mock('@/app/actions/rsvp')
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

const defaultProps = {
  showCeremony: true,
  showReception: true,
  ceremonyName: 'Test Ceremony',
  receptionName: 'Test Reception',
}

describe('RSVPForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    render(<RSVPForm {...defaultProps} />)

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByText(/will you be attending/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit rsvp/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<RSVPForm {...defaultProps} />)

    const submitButton = screen.getByRole('button', { name: /submit rsvp/i })
    await user.click(submitButton)

    const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement

    expect(firstNameInput.validity.valueMissing).toBe(true)
    expect(emailInput.validity.valueMissing).toBe(true)
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockSubmitRSVP = submitRSVP as jest.MockedFunction<typeof submitRSVP>
    mockSubmitRSVP.mockResolvedValue({
      success: true,
      token: 'test-token',
      data: { id: '1' },
    })

    render(<RSVPForm {...defaultProps} />)

    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /submit rsvp/i }))

    await waitFor(() => {
      expect(mockSubmitRSVP).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          attending: true,
        })
      )
    })
  })

  it('displays error message on submission failure', async () => {
    const user = userEvent.setup()
    const mockSubmitRSVP = submitRSVP as jest.MockedFunction<typeof submitRSVP>
    mockSubmitRSVP.mockResolvedValue({
      success: false,
      error: 'Invalid email format',
    })

    render(<RSVPForm {...defaultProps} />)

    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /submit rsvp/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })
  })

  it('allows selecting attending status', async () => {
    const user = userEvent.setup()
    render(<RSVPForm {...defaultProps} />)

    const notAttendingRadio = screen.getByLabelText(/sorry, i can't make it/i)
    await user.click(notAttendingRadio)

    expect(notAttendingRadio).toBeChecked()
  })

  it('shows attendance options using venue names from props', () => {
    render(<RSVPForm {...defaultProps} />)

    expect(screen.getByText('Both Events')).toBeInTheDocument()
    expect(screen.getByText('Test Ceremony Only')).toBeInTheDocument()
    expect(screen.getByText('Test Reception Only')).toBeInTheDocument()
  })

  it('hides attendance field when only one venue is enabled', () => {
    render(
      <RSVPForm
        showCeremony={false}
        showReception={true}
        ceremonyName="Test Ceremony"
        receptionName="Test Reception"
      />
    )

    expect(screen.queryByText('Both Events')).not.toBeInTheDocument()
    expect(screen.getByText('Test Reception')).toBeInTheDocument()
  })
})
