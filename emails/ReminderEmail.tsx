/**
 * Wedding reminder email template
 * Content adapts to the guest's attendance_type and is_inc status.
 * The "days away" count is computed at send time from NEXT_PUBLIC_WEDDING_DATE.
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { AttendanceType } from '@/lib/types'

interface ReminderEmailProps {
  firstName: string
  attendanceType: AttendanceType
  isInc: boolean
  daysAway: number
  weddingDateFormatted: string
}

export function ReminderEmail({
  firstName,
  attendanceType,
  isInc,
  daysAway,
  weddingDateFormatted,
}: ReminderEmailProps) {
  const showChurch = attendanceType === 'church' || attendanceType === 'both'
  const showReception = attendanceType === 'reception' || attendanceType === 'both'

  const daysLabel =
    daysAway === 1
      ? 'just 1 day away'
      : daysAway === 0
        ? 'today'
        : `${daysAway} days away`

  const preview = `Our wedding is ${daysLabel}! We can't wait to celebrate with you.`

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Heading style={coupleStyle}>Jann Daniel & Faith</Heading>
            <Text style={weddingDateStyle}>{weddingDateFormatted}</Text>
          </Section>

          <Hr style={dividerStyle} />

          {/* Greeting */}
          <Section style={sectionStyle}>
            <Heading as="h2" style={headingStyle}>
              Our wedding is {daysLabel}!
            </Heading>
            <Text style={bodyTextStyle}>
              Dear {firstName},
            </Text>
            <Text style={bodyTextStyle}>
              We are so excited to celebrate our special day with you. This is a
              friendly reminder that our wedding is coming up — we can't wait to
              see you there!
            </Text>
          </Section>

          <Hr style={dividerStyle} />

          {/* Church Ceremony */}
          {showChurch && (
            <Section style={sectionStyle}>
              <Heading as="h3" style={subheadingStyle}>
                Church Ceremony
              </Heading>
              <Section style={timeChangeBoxStyle}>
                <Text style={timeChangeTitleStyle}>Time Change Notice</Text>
                <Text style={timeChangeBodyStyle}>
                  Please note that the church ceremony time has been updated.
                  The ceremony will now begin at <strong>2:00 PM</strong>{' '}
                  (previously 2:15 PM). Please update your plans accordingly
                  and aim to arrive 15–20 minutes early.
                </Text>
              </Section>
              <Text style={bodyTextStyle}>
                <strong>Venue:</strong> Iglesia Ni Cristo – Locale of Pasay
                <br />
                <strong>Location:</strong> Pasay City, Metro Manila
                <br />
                <strong>Date:</strong> May 2, 2026
                <br />
                <strong>Time:</strong> 2:00 PM
              </Text>
              <Text style={noteTextStyle}>
                Please arrive 15–20 minutes early to be seated before the
                ceremony begins.
              </Text>

              {/* Church reminders for non-INC guests only */}
              {!isInc && (
                <Section style={reminderBoxStyle}>
                  <Text style={reminderTitleStyle}>Church Reminders</Text>
                  <Text style={reminderBodyStyle}>
                    As our guest, we kindly ask you to observe the following
                    during the worship service:
                  </Text>
                  <Text style={reminderListStyle}>
                    • Men are seated on the left side of the aisle; women on
                    the right side.
                  </Text>
                  <Text style={reminderListStyle}>
                    • Remain seated quietly and avoid unnecessary movement
                    during worship.
                  </Text>
                  <Text style={reminderListStyle}>
                    • Set your mobile phone to silent. Photos and videos inside
                    the church during the worship service are not allowed.
                  </Text>
                  <Text style={reminderListStyle}>
                    • Respect the prayer by remaining quiet while members
                    respond with "Yes" or "Amen" as led by the minister.
                  </Text>
                  <Text style={reminderFootnoteStyle}>
                    These practices are part of the worship tradition. Your
                    respectful presence is appreciated.
                  </Text>
                </Section>
              )}
            </Section>
          )}

          {/* Divider between church and reception sections */}
          {showChurch && showReception && <Hr style={dividerStyle} />}

          {/* Reception */}
          {showReception && (
            <Section style={sectionStyle}>
              <Heading as="h3" style={subheadingStyle}>
                Reception
              </Heading>
              <Text style={bodyTextStyle}>
                <strong>Venue:</strong> Admiral Hotel Manila – MGallery
                <br />
                <strong>Location:</strong> Roxas Boulevard, Manila
                <br />
                <strong>Time:</strong> 6:00 PM
              </Text>
              <Text style={noteTextStyle}>
                Join us for dinner, dancing, and celebration as we begin our
                journey together.
              </Text>
            </Section>
          )}

          <Hr style={dividerStyle} />

          {/* Attire */}
          <Section style={sectionStyle}>
            <Heading as="h3" style={subheadingStyle}>
              Attire — Strictly Formal
            </Heading>
            <Text style={bodyTextStyle}>
              <strong>Gentlemen:</strong> Barong Tagalog
              <br />
              <strong>Ladies:</strong> Long Gown / Dress
            </Text>
            <Text style={noteTextStyle}>
              Color palette: Deep Forest Green, Standard Green, Olive Green,
              Sand Beige, and Deep Brown. Please honor the dress code to ensure
              a cohesive and elegant celebration.
            </Text>
          </Section>

          <Hr style={dividerStyle} />

          {/* Closing */}
          <Section style={sectionStyle}>
            <Text style={bodyTextStyle}>
              We are looking forward to sharing this moment with you. See you
              soon!
            </Text>
            <Text style={signatureStyle}>
              With love,
              <br />
              <strong>Jann Daniel &amp; Faith</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              You received this email because you RSVP'd to our wedding.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const bodyStyle: React.CSSProperties = {
  backgroundColor: '#fdf8f3',
  fontFamily: 'Georgia, serif',
  margin: 0,
  padding: '24px 0',
}

const containerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  maxWidth: '560px',
  margin: '0 auto',
  padding: '0',
  border: '1px solid #e8d9c8',
}

const headerStyle: React.CSSProperties = {
  backgroundColor: '#7a1e2e',
  borderRadius: '8px 8px 0 0',
  padding: '32px 40px',
  textAlign: 'center',
}

const coupleStyle: React.CSSProperties = {
  color: '#fdf8f3',
  fontSize: '28px',
  fontFamily: 'Georgia, serif',
  margin: '0 0 8px 0',
  letterSpacing: '1px',
}

const weddingDateStyle: React.CSSProperties = {
  color: '#f5e6d3',
  fontSize: '14px',
  margin: 0,
  letterSpacing: '1px',
}

const sectionStyle: React.CSSProperties = {
  padding: '24px 40px',
}

const headingStyle: React.CSSProperties = {
  color: '#5a1020',
  fontSize: '22px',
  fontFamily: 'Georgia, serif',
  margin: '0 0 16px 0',
}

const subheadingStyle: React.CSSProperties = {
  color: '#5a1020',
  fontSize: '17px',
  fontFamily: 'Georgia, serif',
  margin: '0 0 12px 0',
  borderLeft: '3px solid #7a1e2e',
  paddingLeft: '12px',
}

const bodyTextStyle: React.CSSProperties = {
  color: '#3d1a22',
  fontSize: '15px',
  lineHeight: '1.7',
  margin: '0 0 12px 0',
}

const noteTextStyle: React.CSSProperties = {
  color: '#7a4a55',
  fontSize: '13px',
  fontStyle: 'italic',
  lineHeight: '1.6',
  margin: '0 0 8px 0',
}

const reminderBoxStyle: React.CSSProperties = {
  backgroundColor: '#eff6ff',
  borderLeft: '4px solid #2563eb',
  borderRadius: '0 6px 6px 0',
  padding: '16px',
  marginTop: '12px',
}

const reminderTitleStyle: React.CSSProperties = {
  color: '#1e40af',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 6px 0',
}

const reminderBodyStyle: React.CSSProperties = {
  color: '#3d1a22',
  fontSize: '13px',
  margin: '0 0 8px 0',
}

const reminderListStyle: React.CSSProperties = {
  color: '#3d1a22',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: '0 0 4px 0',
  paddingLeft: '4px',
}

const reminderFootnoteStyle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '12px',
  fontStyle: 'italic',
  margin: '8px 0 0 0',
}

const signatureStyle: React.CSSProperties = {
  color: '#3d1a22',
  fontSize: '15px',
  lineHeight: '1.8',
  margin: '16px 0 0 0',
}

const dividerStyle: React.CSSProperties = {
  borderColor: '#e8d9c8',
  margin: '0',
}

const footerStyle: React.CSSProperties = {
  backgroundColor: '#fdf8f3',
  borderRadius: '0 0 8px 8px',
  padding: '16px 40px',
  textAlign: 'center',
}

const footerTextStyle: React.CSSProperties = {
  color: '#9a8070',
  fontSize: '12px',
  margin: 0,
}

const timeChangeBoxStyle: React.CSSProperties = {
  backgroundColor: '#fffbeb',
  borderLeft: '4px solid #d97706',
  borderRadius: '0 6px 6px 0',
  padding: '16px',
  marginBottom: '16px',
}

const timeChangeTitleStyle: React.CSSProperties = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 6px 0',
}

const timeChangeBodyStyle: React.CSSProperties = {
  color: '#3d1a22',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: 0,
}
