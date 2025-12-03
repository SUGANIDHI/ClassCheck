"""
Test CRUD operations directly
"""
from datetime import datetime, timedelta
from app import crud, schemas


class TestStudentCRUD:
    """Test student CRUD functions"""

    def test_create_student(self, db_session):
        """Test creating a student"""
        student_data = schemas.StudentCreate(
            name="CRUD Test",
            roll_no="CRUD001",
            department="Testing"
        )
        student = crud.create_student(db_session, student_data)
        assert student.id is not None
        assert student.name == student_data.name

    def test_get_student_by_roll_no(self, db_session, sample_student):
        """Test getting student by roll number"""
        student = crud.get_student_by_roll_no(db_session, sample_student.roll_no)
        assert student is not None
        assert student.id == sample_student.id


class TestPollCRUD:
    """Test poll CRUD functions"""

    def test_create_poll(self, db_session):
        """Test creating a poll"""
        poll = crud.create_poll(db_session, duration_minutes=5)
        assert poll.id is not None
        assert poll.is_active is True
        assert poll.duration_minutes == 5

    def test_get_active_poll(self, db_session, active_poll):
        """Test getting active poll"""
        poll = crud.get_active_poll(db_session)
        assert poll is not None
        assert poll.id == active_poll.id


class TestAttendanceCRUD:
    """Test attendance CRUD functions"""

    def test_mark_attendance(self, db_session, sample_student, active_poll):
        """Test marking attendance"""
        record = crud.mark_attendance(
            db_session,
            student_id=sample_student.id,
            poll_id=active_poll.id
        )
        assert record.id is not None
        assert record.student_id == sample_student.id

    def test_get_attendance_by_poll(self, db_session, sample_student, active_poll):
        """Test getting attendance records for a poll"""
        crud.mark_attendance(db_session, sample_student.id, active_poll.id)
        records = crud.get_attendance_by_poll(db_session, active_poll.id)
        assert len(records) == 1
        assert records[0].student_id == sample_student.id