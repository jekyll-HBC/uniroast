"""merge profile fields and follows table

Revision ID: d4e5f6a7b8c9
Revises: 252729297d40, c3d4e5f6a7b8
Create Date: 2026-04-23 20:00:00.000000

"""
from typing import Sequence, Union

# revision identifiers, used by Alembic.
revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, Sequence[str], None] = ('252729297d40', 'c3d4e5f6a7b8')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
