/**
 * Wedding reminder email template
 * Content adapts to the guest's attendance_type.
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
import { config } from '@/lib/config'

interface ReminderEmailProps {
  firstName: string
  attendanceType: AttendanceType
  daysAway: number
  weddingDateFormatted: string
}

export function ReminderEmail({
  firstName,
  attendanceType,
  daysAway,
  weddingDateFormatted,
}: ReminderEmailProps) {
  const showCeremony = attendanceType === 'ceremony' || attendanceType === 'both'
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
            <Heading style={coupleStyle}>{config.email.senderName}</Heading>
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

          {/* Ceremony */}
          {showCeremony && (
            <Section style={sectionStyle}>
              <Heading as="h3" style={subheadingStyle}>
                Ceremony
              </Heading>
              <Text style={bodyTextStyle}>
                <strong>Venue:</strong> {config.ceremony.name}
                <br />
                <strong>Location:</strong> {config.ceremony.address}
                <br />
                <strong>Date:</strong> {config.ceremony.date}
                <br />
                <strong>Time:</strong> {config.ceremony.time}
              </Text>
              <Text style={noteTextStyle}>
                {config.ceremony.note}
              </Text>
            </Section>
          )}

          {/* Divider between ceremony and reception sections */}
          {showCeremony && showReception && <Hr style={dividerStyle} />}

          {/* Reception */}
          {showReception && (
            <Section style={sectionStyle}>
              <Heading as="h3" style={subheadingStyle}>
                Reception
              </Heading>
              <Text style={bodyTextStyle}>
                <strong>Venue:</strong> {config.reception.name}
                <br />
                <strong>Location:</strong> {config.reception.address}
                <br />
                <strong>Time:</strong> {config.reception.time}
              </Text>
              <Text style={noteTextStyle}>
                {config.reception.note}
              </Text>
            </Section>
          )}

          <Hr style={dividerStyle} />

          {/* Attire */}
          <Section style={sectionStyle}>
            <Heading as="h3" style={subheadingStyle}>
              Attire — {config.attire.dress}
            </Heading>
            <Text style={bodyTextStyle}>
              <strong>Gentlemen:</strong> {config.attire.male}
              <br />
              <strong>Ladies:</strong> {config.attire.female}
            </Text>
            <Text style={noteTextStyle}>
              {config.attire.note}
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
              <strong>{config.email.senderName}</strong>
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
