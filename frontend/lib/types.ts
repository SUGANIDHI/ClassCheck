export interface Student {
  id: number
  name: string
  roll_no: string
  department: string
  created_at: string
}

export interface AttendancePoll {
  id: number
  start_time: string
  end_time: string
  duration_minutes: number
  is_active: boolean
  created_at: string
}

export interface PollStatus {
  is_active: boolean
  poll_id?: number
  start_time?: string
  end_time?: string
  remaining_seconds?: number
}

export interface AttendanceRecord {
  id: number
  student_id: number
  poll_id: number
  marked_at: string
  student_name?: string
  student_roll_no?: string
}

export interface AttendanceLog {
  poll_id: number
  start_time: string
  end_time: string
  total_students: number
  present_count: number
  absent_count: number
  attendance_percentage: number
  records: AttendanceRecord[]
}