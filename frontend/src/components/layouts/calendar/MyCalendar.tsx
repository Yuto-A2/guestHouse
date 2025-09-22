import { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

export default function MyCalendar() {
  const [value, setValue] = useState<Date | null>(null)

  return (
    <div>
      <Calendar
        locale="en-CA"              
        value={value ?? undefined}
        onClickDay={(date: Date) => setValue(date)}
      />

      <div className="mt-2">
        {value
          ? value.toLocaleDateString('en-CA', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })
          : 'Please select a date'}
      </div>
    </div>
  )
}
