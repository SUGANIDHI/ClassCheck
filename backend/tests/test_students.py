"""
Test student CRUD operations
"""
import pytest


class TestStudentCreation:
    """Test student creation"""

    def test_create_student_success(self, client):
        """Test successful student creation"""
        student_data = {
            "name": "Test Student",
            "roll_no": "TEST001",
            "department": "Testing"
        }
        response = client.post("/students/", json=student_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == student_data["name"]
        assert data["roll_no"] == student_data["roll_no"]
        assert data["department"] == student_data["department"]
        assert "id" in data
        assert "created_at" in data

    def test_create_student_duplicate_roll_no(self, client, sample_student):
        """Test creating student with duplicate roll number"""
        student_data = {
            "name": "Another Student",
            "roll_no": sample_student.roll_no,
            "department": "Testing"
        }
        response = client.post("/students/", json=student_data)
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    def test_create_student_invalid_data(self, client):
        """Test creating student with invalid data"""
        student_data = {
            "name": "",
            "roll_no": "",
            "department": ""
        }
        response = client.post("/students/", json=student_data)
        assert response.status_code == 422


class TestStudentRetrieval:
    """Test student retrieval"""

    def test_get_all_students(self, client, sample_students):
        """Test getting all students"""
        response = client.get("/students/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == len(sample_students)

    def test_get_student_by_id(self, client, sample_student):
        """Test getting student by ID"""
        response = client.get(f"/students/{sample_student.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_student.id
        assert data["name"] == sample_student.name
        assert data["roll_no"] == sample_student.roll_no

    def test_get_nonexistent_student(self, client):
        """Test getting non-existent student"""
        response = client.get("/students/99999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_get_students_empty(self, client):
        """Test getting students when none exist"""
        response = client.get("/students/")
        assert response.status_code == 200
        assert response.json() == []


class TestStudentUpdate:
    """Test student update"""

    def test_update_student_name(self, client, sample_student):
        """Test updating student name"""
        update_data = {"name": "Updated Name"}
        response = client.put(f"/students/{sample_student.id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["roll_no"] == sample_student.roll_no

    def test_update_student_all_fields(self, client, sample_student):
        """Test updating all student fields"""
        update_data = {
            "name": "New Name",
            "roll_no": "NEW001",
            "department": "New Department"
        }
        response = client.put(f"/students/{sample_student.id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["roll_no"] == update_data["roll_no"]
        assert data["department"] == update_data["department"]

    def test_update_nonexistent_student(self, client):
        """Test updating non-existent student"""
        update_data = {"name": "New Name"}
        response = client.put("/students/99999", json=update_data)
        assert response.status_code == 404

    def test_update_student_duplicate_roll_no(self, client, sample_students):
        """Test updating student with duplicate roll number"""
        update_data = {"roll_no": sample_students[1].roll_no}
        response = client.put(f"/students/{sample_students[0].id}", json=update_data)
        assert response.status_code == 400


class TestStudentDeletion:
    """Test student deletion"""

    def test_delete_student(self, client, sample_student):
        """Test deleting student"""
        response = client.delete(f"/students/{sample_student.id}")
        assert response.status_code == 204

        # Verify deletion
        get_response = client.get(f"/students/{sample_student.id}")
        assert get_response.status_code == 404

    def test_delete_nonexistent_student(self, client):
        """Test deleting non-existent student"""
        response = client.delete("/students/99999")
        assert response.status_code == 404

    def test_delete_student_with_attendance(self, client, sample_student, active_poll, db_session):
        """Test deleting student who has attendance records"""
        from app.models import AttendanceRecord
        
        # Create attendance record
        record = AttendanceRecord(
            student_id=sample_student.id,
            poll_id=active_poll.id
        )
        db_session.add(record)
        db_session.commit()

        # Delete should still work (cascade)
        response = client.delete(f"/students/{sample_student.id}")
        assert response.status_code == 204