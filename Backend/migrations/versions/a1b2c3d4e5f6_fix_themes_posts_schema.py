"""fix themes and posts schema

Revision ID: a1b2c3d4e5f6
Revises: 08d07fe5f3e5
Create Date: 2026-03-30

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '08d07fe5f3e5'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # themes: drop old 'date' column, add new columns
    op.drop_index('ix_themes_date', table_name='themes')
    op.drop_column('themes', 'date')
    op.add_column('themes', sa.Column('emoji', sa.String(length=10), nullable=True))
    op.add_column('themes', sa.Column('description', sa.String(length=200), nullable=True))
    op.add_column('themes', sa.Column('is_official', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('themes', sa.Column('active_date', sa.Date(), nullable=True))
    op.add_column('themes', sa.Column('creator_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True))
    op.add_column('themes', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    # set default emoji for existing rows
    op.execute("UPDATE themes SET emoji = '🔥' WHERE emoji IS NULL")
    op.alter_column('themes', 'emoji', nullable=False)

    # posts: drop old 'theme' string column, add theme_id FK
    op.add_column('posts', sa.Column('theme_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_posts_theme_id', 'posts', 'themes', ['theme_id'], ['id'])
    op.drop_column('posts', 'theme')


def downgrade() -> None:
    op.add_column('posts', sa.Column('theme', sa.String(length=100), nullable=True))
    op.drop_constraint('fk_posts_theme_id', 'posts', type_='foreignkey')
    op.drop_column('posts', 'theme_id')

    op.drop_column('themes', 'created_at')
    op.drop_column('themes', 'creator_id')
    op.drop_column('themes', 'active_date')
    op.drop_column('themes', 'is_official')
    op.drop_column('themes', 'description')
    op.drop_column('themes', 'emoji')
    op.add_column('themes', sa.Column('date', sa.DateTime(timezone=True), nullable=True))
    op.create_index('ix_themes_date', 'themes', ['date'])
