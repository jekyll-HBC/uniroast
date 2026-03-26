"""
conftest.py — sets env vars and patches database before any app module is imported.
"""
import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Must be set before any app import
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key")

# Patch database module to use SQLite
import database as _db_module

_TEST_ENGINE = create_engine("sqlite:///./test.db", connect_args={"check_same_thread": False})
_TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=_TEST_ENGINE)

_db_module.engine = _TEST_ENGINE
_db_module.SessionLocal = _TestingSession


@pytest.fixture(autouse=True)
def reset_db():
    from database import Base
    Base.metadata.create_all(bind=_TEST_ENGINE)
    yield
    Base.metadata.drop_all(bind=_TEST_ENGINE)
