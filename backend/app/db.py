import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Compose gives us a plain "postgresql://" URL; SQLAlchemy needs to be told
# to use the psycopg driver we installed on Day 2.
DATABASE_URL = os.environ["DATABASE_URL"].replace(
    "postgresql://", "postgresql+psycopg://", 1
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False)


class Base(DeclarativeBase):
    """All models inherit from this, so Alembic can find every table."""