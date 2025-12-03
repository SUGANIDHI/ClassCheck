"""
Pytest configuration and fixtures
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app import models

# Create test database in memory
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database session"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    
    # FIXED: Use app parameter correctly for newer versions
    client = TestClient(app=app)
    yield client
    client.close()
    
    app.dependency_overrides.clear()


@pytest.fixture
def sample_student(db_session):
    """Create a sample student for testing"""
    student = models.Student(
        name="John Doe",
        roll_no="TEST001",
        department="Computer Science"
    )
    db_session.add(student)
    db_session.commit()
    db_session.refresh(student)
    return student


@pytest.fixture
def sample_students(db_session):
    """Create multiple sample students"""
    students = [
        models.Student(name="Alice Smith", roll_no="CS001", department="Computer Science"),
        models.Student(name="Bob Johnson", roll_no="CS002", department="Computer Science"),
        models.Student(name="Charlie Brown", roll_no="EC001", department="Electronics"),
    ]
    for student in students:
        db_session.add(student)
    db_session.commit()
    for student in students:
        db_session.refresh(student)
    return students


@pytest.fixture
def active_poll(db_session):
    """Create an active attendance poll"""
    from datetime import datetime, timedelta
    
    poll = models.AttendancePoll(
        start_time=datetime.utcnow(),
        end_time=datetime.utcnow() + timedelta(minutes=5),
        duration_minutes=5,
        is_active=True
    )
    db_session.add(poll)
    db_session.commit()
    db_session.refresh(poll)
    return poll