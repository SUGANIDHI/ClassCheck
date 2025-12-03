from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

# Student Schemas
class StudentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    roll_no: str = Field(..., min_length=1, max_length=50)
    department: str = Field(..., min_length=1, max_length=100)

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    roll_no: Optional[str] = Field(None, min_length=1, max_length=50)
    department: Optional[str] = Field(None, min_length=1, max_length=100)

class StudentResponse(StudentBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Attendance Poll Schemas
class PollCreate(BaseModel):
    duration_minutes: int = Field(..., gt=0, le=60)

class PollResponse(BaseModel):
    id: int
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class PollStatus(BaseModel):
    is_active: bool
    poll_id: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    remaining_seconds: Optional[int] = None

# Attendance Record Schemas
class AttendanceMarkRequest(BaseModel):
    student_id: int
    poll_id: int

class AttendanceRecordResponse(BaseModel):
    id: int
    student_id: int
    poll_id: int
    marked_at: datetime
    student_name: Optional[str] = None
    student_roll_no: Optional[str] = None
    
    class Config:
        from_attributes = True

class AttendanceLogResponse(BaseModel):
    poll_id: int
    start_time: datetime
    end_time: datetime
    total_students: int
    present_count: int
    absent_count: int
    attendance_percentage: float
    records: List[AttendanceRecordResponse]