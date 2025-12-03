from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
from .. import crud, schemas
from ..database import get_db

router = APIRouter(
    prefix="/attendance",
    tags=["attendance"]
)

@router.post("/start", response_model=schemas.PollResponse, status_code=status.HTTP_201_CREATED)
def start_poll(poll: schemas.PollCreate, db: Session = Depends(get_db)):
    """Start a new attendance poll"""
    db_poll = crud.create_poll(db=db, duration_minutes=poll.duration_minutes)
    return db_poll

@router.get("/current", response_model=schemas.PollStatus)
def get_current_poll(db: Session = Depends(get_db)):
    """Get the current active poll status"""
    poll = crud.get_active_poll(db)
    
    if not poll:
        return schemas.PollStatus(is_active=False)
    
    now = datetime.utcnow()
    remaining_seconds = int((poll.end_time - now).total_seconds())
    
    return schemas.PollStatus(
        is_active=True,
        poll_id=poll.id,
        start_time=poll.start_time,
        end_time=poll.end_time,
        remaining_seconds=max(0, remaining_seconds)
    )

@router.post("/mark", response_model=schemas.AttendanceRecordResponse)
def mark_attendance(
    attendance: schemas.AttendanceMarkRequest,
    db: Session = Depends(get_db)
):
    """Mark attendance for a student"""
    # Verify student exists
    student = crud.get_student(db, student_id=attendance.student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Verify poll exists and is active
    poll = crud.get_poll(db, poll_id=attendance.poll_id)
    if not poll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Poll not found"
        )
    
    now = datetime.utcnow()
    if now < poll.start_time or now > poll.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Poll has expired or not yet started"
        )
    
    # Mark attendance
    record = crud.mark_attendance(
        db=db,
        student_id=attendance.student_id,
        poll_id=attendance.poll_id
    )
    
    return schemas.AttendanceRecordResponse(
        id=record.id,
        student_id=record.student_id,
        poll_id=record.poll_id,
        marked_at=record.marked_at,
        student_name=student.name,
        student_roll_no=student.roll_no
    )

@router.get("/logs/{poll_id}", response_model=schemas.AttendanceLogResponse)
def get_attendance_logs(poll_id: int, db: Session = Depends(get_db)):
    """Get attendance logs for a specific poll"""
    poll = crud.get_poll(db, poll_id=poll_id)
    if not poll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Poll not found"
        )
    
    records = crud.get_attendance_by_poll(db, poll_id=poll_id)
    total_students = len(crud.get_students(db))
    present_count = len(records)
    absent_count = total_students - present_count
    
    percentage = (present_count / total_students * 100) if total_students > 0 else 0
    
    record_responses = [
        schemas.AttendanceRecordResponse(
            id=r.id,
            student_id=r.student_id,
            poll_id=r.poll_id,
            marked_at=r.marked_at,
            student_name=r.student.name,
            student_roll_no=r.student.roll_no
        )
        for r in records
    ]
    
    return schemas.AttendanceLogResponse(
        poll_id=poll.id,
        start_time=poll.start_time,
        end_time=poll.end_time,
        total_students=total_students,
        present_count=present_count,
        absent_count=absent_count,
        attendance_percentage=round(percentage, 2),
        records=record_responses
    )

@router.get("/logs", response_model=List[schemas.PollResponse])
def get_all_polls(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Get all attendance polls"""
    polls = crud.get_polls(db, skip=skip, limit=limit)
    return polls

@router.get("/student/{student_id}", response_model=List[schemas.AttendanceRecordResponse])
def get_student_attendance(student_id: int, db: Session = Depends(get_db)):
    """Get attendance history for a specific student"""
    student = crud.get_student(db, student_id=student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    records = crud.get_student_attendance_history(db, student_id=student_id)
    
    return [
        schemas.AttendanceRecordResponse(
            id=r.id,
            student_id=r.student_id,
            poll_id=r.poll_id,
            marked_at=r.marked_at,
            student_name=student.name,
            student_roll_no=student.roll_no
        )
        for r in records
    ]