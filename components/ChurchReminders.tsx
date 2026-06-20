/**
 * Church Reminders Component
 * Displays worship etiquette for non-INC guests attending the church ceremony
 */

interface ChurchRemindersProps {
  className?: string
}

export default function ChurchReminders({ className = '' }: ChurchRemindersProps) {
  return (
    <div className={`bg-blue-50/50 border-l-4 border-blue-600 p-6 rounded-r-lg shadow-sm ${className}`}>
      <h4 className="text-lg font-semibold text-wedding-maroon-dark mb-3 flex items-center gap-2">
        <svg 
          className="w-5 h-5 text-blue-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        Church Reminders
      </h4>
      
      <p className="text-sm text-wedding-maroon-dark mb-4">
        During the worship service, Iglesia Ni Cristo members are expected to:
      </p>
      
      <ul className="space-y-2 text-sm text-wedding-maroon-dark">
        <li className="flex items-start gap-2">
          <span className="text-blue-600 leading-relaxed flex-shrink-0">•</span>
          <span className="flex-1">Observe proper seating, with men seated on the left side of the aisle and women on the right side.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-600 leading-relaxed flex-shrink-0">•</span>
          <span className="flex-1">Observe proper reverence inside the church, by remaining seated quietly and avoiding unnecessary movement during worship.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-600 leading-relaxed flex-shrink-0">•</span>
          <span className="flex-1">Mobile phones should be set to silent mode before the worship service begins. Taking photos or videos inside the church during the worship service is not allowed.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-600 leading-relaxed flex-shrink-0">•</span>
          <span className="flex-1">Respect the prayer by remaining quiet while Iglesia Ni Cristo members close their eyes and respond with “Yes” or “Amen” in unison as led by the minister.</span>
        </li>
      </ul>
      
      <p className="text-xs text-wedding-maroon/70 mt-4 italic">
        These practices are part of the worship tradition. Your respectful presence is appreciated.
      </p>
    </div>
  )
}

