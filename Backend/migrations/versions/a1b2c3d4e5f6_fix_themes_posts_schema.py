"""fix themes and posts schema

Revision ID: a1b2c3d4e5f6
Revises: 08d07fe5f3e5
Create Date: 2026-03-30

"""
from typing import Sequence, Union
from alembic import op

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '08d07fe5f3e5'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_themes_date")
    op.execute("ALTER TABLE themes DROP COLUMN IF EXISTS date")
    op.execute("ALTER TABLE themes ADD COLUMN IF NOT EXISTS emoji VARCHAR(10) NOT NULL DEFAULT '🔥'")
    op.execute("ALTER TABLE themes ADD COLUMN IF NOT EXISTS description VARCHAR(200)")
    op.execute("ALTER TABLE themes ADD COLUMN IF NOT EXISTS is_official BOOLEAN NOT NULL DEFAULT false")
    op.execute("ALTER TABLE themes ADD COLUMN IF NOT EXISTS active_date DATE")
    op.execute("ALTER TABLE themes ADD COLUMN IF NOT EXISTS creator_id INTEGER REFERENCES users(id)")
    op.execute("ALTER TABLE themes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now()")
    op.execute("ALTER TABLE posts ADD COLUMN IF NOT EXISTS theme_id INTEGER REFERENCES themes(id)")
    op.execute("ALTER TABLE posts DROP COLUMN IF EXISTS theme")


def downgrade() -> None:
    pass
