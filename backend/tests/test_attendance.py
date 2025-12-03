"""
Test attendance operations
"""
import pytest
from datetime import datetime, timedelta


class TestPollCreation:
    """Test attendance poll creation"""

    def test_start_poll(self, client):
        """Test starting an attendance poll"""
        poll_data = {"duration_minutes": 5}
        response = client.post("/attendance/start", json=poll_data)
        assert response.status_code == 201
        data = response.json()
        assert data["duration_minutes"] == 5
        assert data["is_active"] is True
        assert "start_time" in data
        assert "end_time" in data

    def test_start_poll_invalid_duration(self, client):
        """Test starting poll with invalid duration"""
        poll_data = {"duration_minutes": 0}
        response = client.post("/attendance/start", json=poll_data)
        assert response.status_code == 422

    def test_start_multiple_polls(self, client):
        """Test starting multiple polls deactivates previous"""
        # Start first poll
        client.post("/attendance/start", json={"duration_minutes": 5})
        
        # Start second poll
        response = client.post("/attendance/start", json={"duration_minutes": 3})
        assert response.status_code == 201
        
        # Check current poll
        current = client.get("/attendance/current")
        assert current.json()["is_active"] is True


class TestPollStatus:
    """Test poll status retrieval"""

    def test_get_current_poll_active(self, client, active_poll):
        """Test getting current active poll"""
        response = client.get("/attendance/current")
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is True
        assert data["poll_id"] == active_poll.id
        assert "remaining_seconds" in data

    def test_get_current_poll_inactive(self, client):
        """Test getting current poll when none active"""
        response = client.get("/attendance/current")
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is False

    def test_get_current_poll_expired(self, client, db_session):
        """Test getting poll that has expired"""
        from app.models import AttendancePoll
        
        # Create expired poll
        poll = AttendancePoll(
            start_time=datetime.utcnow() - timedelta(minutes=10),
            end_time=datetime.utcnow() - timedelta(minutes=5),
            duration_minutes=5,
            is_active=True
        )
        db_session.add(poll)
        db_session.commit()

        response = client.get("/attendance/current")
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is False


class TestAttendanceMarking:
    """Test marking attendance"""

    def test_mark_attendance_success(self, client, sample_student, active_poll):
        """Test successfully marking attendance"""
        attendance_data = {
            "student_id": sample_student.id,
            "poll_id": active_poll.id
        }
        response = client.post("/attendance/mark", json=attendance_data)
        assert response.status_code == 200
        data = response.json()
        assert data["student_id"] == sample_student.id
        assert data["poll_id"] == active_poll.id
        assert "marked_at" in data

    def test_mark_attendance_duplicate(self, client, sample_student, active_poll):
        """Test marking attendance twice returns same record"""
        attendance_data = {
            "student_id": sample_student.id,
            "poll_id": active_poll.id
        }
        # First mark
        response1 = client.post("/attendance/mark", json=attendance_data)
        assert response1.status_code == 200
        
        # Second mark (should return existing)
        response2 = client.post("/attendance/mark", json=attendance_data)
        assert response2.status_code == 200
        assert response1.json()["id"] == response2.json()["id"]

    def test_mark_attendance_nonexistent_student(self, client, active_poll):
        """Test marking attendance for non-existent student"""
        attendance_data = {
            "student_id": 99999,
            "poll_id": active_poll.id
        }
        response = client.post("/attendance/mark", json=attendance_data)
        assert response.status_code == 404

    def test_mark_attendance_nonexistent_poll(self, client, sample_student):
        """Test marking attendance for non-existent poll"""
        attendance_data = {
            "student_id": sample_student.id,
            "poll_id": 99999
        }
        response = client.post("/attendance/mark", json=attendance_data)
        assert response.status_code == 404

    def test_mark_attendance_expired_poll(self, client, sample_student, db_session):
        """Test marking attendance for expired poll"""
        from app.models import AttendancePoll
        
        # Create expired poll
        poll = AttendancePoll(
            start_time=datetime.utcnow() - timedelta(minutes=10),
            end_time=datetime.utcnow() - timedelta(minutes=5),
            duration_minutes=5,
            is_active=True
        )
        db_session.add(poll)
        db_session.commit()

        attendance_data = {
            "student_id": sample_student.id,
            "poll_id": poll.id
        }
        response = client.post("/attendance/mark", json=attendance_data)
        assert response.status_code == 400
        assert "expired" in response.json()["detail"].lower()


class TestAttendanceLogs:
    """Test attendance logs and reports"""

    def test_get_attendance_logs(self, client, active_poll, sample_students, db_session):
        """Test getting attendance logs for a poll"""
        from app.models import AttendanceRecord
        
        # Mark attendance for first two students
        for student in sample_students[:2]:
            record = AttendanceRecord(
                student_id=student.id,
                poll_id=active_poll.id
            )
            db_session.add(record)
        db_session.commit()

        response = client.get(f"/attendance/logs/{active_poll.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["poll_id"] == active_poll.id
        assert data["total_students"] == len(sample_students)
        assert data["present_count"] == 2
        assert data["absent_count"] == 1
        assert len(data["records"]) == 2

    def test_get_logs_nonexistent_poll(self, client):
        """Test getting logs for non-existent poll"""
        response = client.get("/attendance/logs/99999")
        assert response.status_code == 404

    def test_get_all_polls(self, client, db_session):
        """Test getting all polls"""
        from app.models import AttendancePoll
        
        # Create multiple polls
        for i in range(3):
            poll = AttendancePoll(
                start_time=datetime.utcnow(),
                end_time=datetime.utcnow() + timedelta(minutes=5),
                duration_minutes=5,
                is_active=False
            )
            db_session.add(poll)
        db_session.commit()

        response = client.get("/attendance/logs")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3

    def test_get_student_attendance_history(self, client, sample_student, db_session):
        """Test getting attendance history for a student"""
        from app.models import AttendancePoll, AttendanceRecord
        
        # Create polls and mark attendance
        for i in range(3):
            poll = AttendancePoll(
                start_time=datetime.utcnow(),
                end_time=datetime.utcnow() + timedelta(minutes=5),
                duration_minutes=5,
                is_active=False
            )
            db_session.add(poll)
            db_session.flush()
            
            record = AttendanceRecord(
                student_id=sample_student.id,
                poll_id=poll.id
            )
            db_session.add(record)
        db_session.commit()

        response = client.get(f"/attendance/student/{sample_student.id}")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        assert all(r["student_id"] == sample_student.id for r in data)


class TestAttendanceStatistics:
    """Test attendance statistics calculations"""

    def test_attendance_percentage_calculation(self, client, active_poll, sample_students, db_session):
        """Test attendance percentage is calculated correctly"""
        from app.models import AttendanceRecord
        
        # Mark attendance for 2 out of 3 students
        for student in sample_students[:2]:
            record = AttendanceRecord(
                student_id=student.id,
                poll_id=active_poll.id
            )
            db_session.add(record)
        db_session.commit()

        response = client.get(f"/attendance/logs/{active_poll.id}")
        data = response.json()
        expected_percentage = (2 / 3) * 100
        assert abs(data["attendance_percentage"] - expected_percentage) < 0.01

    def test_empty_attendance(self, client, active_poll, sample_students):
        """Test logs when no one has marked attendance"""
        response = client.get(f"/attendance/logs/{active_poll.id}")
        data = response.json()
        assert data["present_count"] == 0
        assert data["absent_count"] == len(sample_students)
        assert data["attendance_percentage"] == 0.0