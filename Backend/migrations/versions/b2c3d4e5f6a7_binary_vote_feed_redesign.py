"""binary vote and feed redesign

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-04-04

Changes:
- votes.score (int) → votes.vote_type (varchar, "heng"|"la")
- posts: add heng_count column
- posts: avg_score repurposed as heng_rate (0.0–1.0)
- add comments and comment_votes tables (Phase 2 placeholders)
- data migration: score 4-5 → heng, 1-2 → la, score=3 rows dropped
"""
from typing import Sequence, Union
from alembic import op

revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Add heng_count to posts
    op.execute("ALTER TABLE posts ADD COLUMN IF NOT EXISTS heng_count INTEGER NOT NULL DEFAULT 0")

    # 2. Add vote_type column to votes (keep score for data migration)
    op.execute("ALTER TABLE votes ADD COLUMN IF NOT EXISTS vote_type VARCHAR(10)")

    # 3. Migrate existing votes: score 4-5 → heng, 1-2 → la
    op.execute("UPDATE votes SET vote_type = 'heng' WHERE score >= 4")
    op.execute("UPDATE votes SET vote_type = 'la'   WHERE score <= 2")
    op.execute("DELETE FROM votes WHERE score = 3")

    # 4. Make vote_type NOT NULL after migration
    op.execute("UPDATE votes SET vote_type = 'la' WHERE vote_type IS NULL")

    # 5. Recompute heng_count per post
    op.execute("""
        UPDATE posts SET heng_count = (
            SELECT COUNT(*) FROM votes
            WHERE votes.post_id = posts.id AND votes.vote_type = 'heng'
        )
    """)

    # 6. Recompute avg_score as heng_rate, reset vote_count from actual votes
    op.execute("""
        UPDATE posts SET
            vote_count = (SELECT COUNT(*) FROM votes WHERE votes.post_id = posts.id),
            avg_score  = CASE
                WHEN (SELECT COUNT(*) FROM votes WHERE votes.post_id = posts.id) = 0 THEN 0.0
                ELSE CAST(heng_count AS FLOAT) /
                     (SELECT COUNT(*) FROM votes WHERE votes.post_id = posts.id)
            END
    """)

    # 7. Drop old score column from votes
    op.execute("ALTER TABLE votes DROP COLUMN IF EXISTS score")

    # 8. Phase 2 placeholder tables
    op.execute("""
        CREATE TABLE IF NOT EXISTS comments (
            id         SERIAL PRIMARY KEY,
            post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
            user_id    INTEGER NOT NULL REFERENCES users(id),
            content    TEXT NOT NULL,
            parent_id  INTEGER REFERENCES comments(id),
            created_at TIMESTAMPTZ DEFAULT now()
        )
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS comment_votes (
            id         SERIAL PRIMARY KEY,
            comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
            user_id    INTEGER NOT NULL REFERENCES users(id),
            created_at TIMESTAMPTZ DEFAULT now()
        )
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS comment_votes")
    op.execute("DROP TABLE IF EXISTS comments")
    op.execute("ALTER TABLE votes ADD COLUMN IF NOT EXISTS score INTEGER NOT NULL DEFAULT 3")
    op.execute("UPDATE votes SET score = 5 WHERE vote_type = 'heng'")
    op.execute("UPDATE votes SET score = 1 WHERE vote_type = 'la'")
    op.execute("ALTER TABLE votes DROP COLUMN IF EXISTS vote_type")
    op.execute("ALTER TABLE posts DROP COLUMN IF EXISTS heng_count")
