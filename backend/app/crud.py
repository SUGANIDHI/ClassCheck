from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta
from typing import List, Optional
from . import models, schemas

# Student CRUD Operations
def create_student(db: Session, student: schemas.StudentCreate) -> models.Student:
    db_student = models.Student(**student.dict())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def get_student(db: Session, student_id: int) -> Optional[models.Student]:
    return db.query(models.Student).filter(models.Student.id == student_id).first()

def get_student_by_roll_no(db: Session, roll_no: str) -> Optional[models.Student]:
    return db.query(models.Student).filter(models.Student.roll_no == roll_no).first()

def get_students(db: Session, skip: int = 0, limit: int = 100) -> List[models.Student]:
    return db.query(models.Student).offset(skip).limit(limit).all()

def update_student(db: Session, student_id: int, student: schemas.StudentUpdate) -> Optional[models.Student]:
    db_student = get_student(db, student_id)
    if db_student:
        update_data = student.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_student, key, value)
        db.commit()
        db.refresh(db_student)
    return db_student

def delete_student(db: Session, student_id: int) -> bool:
    db_student = get_student(db, student_id)
    if db_student:
        db.delete(db_student)
        db.commit()
        return True
    return False

# Attendance Poll CRUD Operations
def create_poll(db: Session, duration_minutes: int) -> models.AttendancePoll:
    start_time = datetime.utcnow()
    end_time = start_time + timedelta(minutes=duration_minutes)
    
    # Deactivate any existing active polls
    db.query(models.AttendancePoll).filter(
        models.AttendancePoll.is_active == True
    ).update({"is_active": False})
    
    db_poll = models.AttendancePoll(
        start_time=start_time,
        end_time=end_time,
        duration_minutes=duration_minutes,
        is_active=True
    )
    db.add(db_poll)
    db.commit()
    db.refresh(db_poll)
    return db_poll

def get_active_poll(db: Session) -> Optional[models.AttendancePoll]:
    now = datetime.utcnow()
    return db.query(models.AttendancePoll).filter(
        and_(
            models.AttendancePoll.is_active == True,
            models.AttendancePoll.start_time <= now,
            models.AttendancePoll.end_time >= now
        )
    ).first()

def get_poll(db: Session, poll_id: int) -> Optional[models.AttendancePoll]:
    return db.query(models.AttendancePoll).filter(models.AttendancePoll.id == poll_id).first()

def get_polls(db: Session, skip: int = 0, limit: int = 50) -> List[models.AttendancePoll]:
    return db.query(models.AttendancePoll).order_by(
        models.AttendancePoll.created_at.desc()
    ).offset(skip).limit(limit).all()

# Attendance Record CRUD Operations
def mark_attendance(db: Session, student_id: int, poll_id: int) -> models.AttendanceRecord:
    # Check if already marked
    existing = db.query(models.AttendanceRecord).filter(
        and_(
            models.AttendanceRecord.student_id == student_id,
            models.AttendanceRecord.poll_id == poll_id
        )
    ).first()
    
    if existing:
        return existing
    
    db_record = models.AttendanceRecord(
        student_id=student_id,
        poll_id=poll_id
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

def get_attendance_by_poll(db: Session, poll_id: int) -> List[models.AttendanceRecord]:
    return db.query(models.AttendanceRecord).filter(
        models.AttendanceRecord.poll_id == poll_id
    ).all()

def get_student_attendance_history(db: Session, student_id: int) -> List[models.AttendanceRecord]:
    return db.query(models.AttendanceRecord).filter(
        models.AttendanceRecord.student_id == student_id
    ).order_by(models.AttendanceRecord.marked_at.desc()).all()