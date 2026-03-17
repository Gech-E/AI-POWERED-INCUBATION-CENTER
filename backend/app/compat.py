"""
Database column type compatibility helpers.

Provides column types that work with both PostgreSQL and SQLite.
- PostgreSQL: Uses native ARRAY, JSONB, UUID types
- SQLite: Falls back to JSON and String types
"""
import uuid as _uuid
from sqlalchemy import String, JSON, TypeDecorator, Text
from sqlalchemy.dialects import postgresql
import json


class UUIDType(TypeDecorator):
    """A type that uses native UUID on PostgreSQL and String(36) on SQLite."""
    impl = String(36)
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(postgresql.UUID(as_uuid=True))
        return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if dialect.name == "postgresql":
            return value if isinstance(value, _uuid.UUID) else _uuid.UUID(str(value))
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, _uuid.UUID):
            return value
        return _uuid.UUID(str(value))


class ArrayType(TypeDecorator):
    """A type that uses ARRAY on PostgreSQL and JSON on SQLite."""
    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(postgresql.ARRAY(String))
        return dialect.type_descriptor(Text())

    def process_bind_param(self, value, dialect):
        if dialect.name == "postgresql":
            return value
        if value is not None:
            return json.dumps(value)
        return value

    def process_result_value(self, value, dialect):
        if dialect.name == "postgresql":
            return value
        if value is not None:
            return json.loads(value)
        return value


class JSONBType(TypeDecorator):
    """A type that uses JSONB on PostgreSQL and JSON/Text on SQLite."""
    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(postgresql.JSONB)
        return dialect.type_descriptor(Text())

    def process_bind_param(self, value, dialect):
        if dialect.name == "postgresql":
            return value
        if value is not None:
            return json.dumps(value)
        return value

    def process_result_value(self, value, dialect):
        if dialect.name == "postgresql":
            return value
        if value is not None and isinstance(value, str):
            return json.loads(value)
        return value
