"""
Database module for MyFinance expense tracker.
Uses SQLite for persistent storage.
"""

import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Optional


DB_PATH = Path(__file__).parent / "expenses.db"


def get_connection() -> sqlite3.Connection:
    """Get a database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Initialize the database with required tables."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            description TEXT,
            category_id INTEGER,
            date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories (id)
        )
    """)
    
    # Insert default categories
    default_categories = [
        "Food & Dining",
        "Transportation",
        "Shopping",
        "Entertainment",
        "Bills & Utilities",
        "Healthcare",
        "Travel",
        "Other"
    ]
    
    for category in default_categories:
        cursor.execute(
            "INSERT OR IGNORE INTO categories (name) VALUES (?)",
            (category,)
        )
    
    conn.commit()
    conn.close()


def add_expense(
    amount: float,
    category_id: int,
    description: Optional[str] = None,
    date: Optional[str] = None
) -> int:
    """Add a new expense and return its ID."""
    if date is None:
        date = datetime.now().strftime("%Y-%m-%d")
    
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        """
        INSERT INTO expenses (amount, description, category_id, date)
        VALUES (?, ?, ?, ?)
        """,
        (amount, description, category_id, date)
    )
    
    expense_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return expense_id


def get_categories() -> list[dict]:
    """Get all categories."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, name FROM categories ORDER BY name")
    categories = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return categories


def get_expenses(
    limit: Optional[int] = None,
    category_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> list[dict]:
    """Get expenses with optional filters."""
    conn = get_connection()
    cursor = conn.cursor()
    
    query = """
        SELECT e.id, e.amount, e.description, e.date, c.name as category
        FROM expenses e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE 1=1
    """
    params = []
    
    if category_id:
        query += " AND e.category_id = ?"
        params.append(category_id)
    
    if start_date:
        query += " AND e.date >= ?"
        params.append(start_date)
    
    if end_date:
        query += " AND e.date <= ?"
        params.append(end_date)
    
    query += " ORDER BY e.date DESC, e.id DESC"
    
    if limit:
        query += " LIMIT ?"
        params.append(limit)
    
    cursor.execute(query, params)
    expenses = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return expenses


def get_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> dict:
    """Get expense summary grouped by category."""
    conn = get_connection()
    cursor = conn.cursor()
    
    query = """
        SELECT c.name as category, SUM(e.amount) as total, COUNT(*) as count
        FROM expenses e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE 1=1
    """
    params = []
    
    if start_date:
        query += " AND e.date >= ?"
        params.append(start_date)
    
    if end_date:
        query += " AND e.date <= ?"
        params.append(end_date)
    
    query += " GROUP BY c.name ORDER BY total DESC"
    
    cursor.execute(query, params)
    by_category = [dict(row) for row in cursor.fetchall()]
    
    # Get total
    total_query = "SELECT SUM(amount) as total FROM expenses WHERE 1=1"
    if start_date:
        total_query += " AND date >= ?"
    if end_date:
        total_query += " AND date <= ?"
    
    cursor.execute(total_query, params)
    result = cursor.fetchone()
    total = result["total"] if result["total"] else 0
    
    conn.close()
    
    return {
        "total": total,
        "by_category": by_category
    }


def delete_expense(expense_id: int) -> bool:
    """Delete an expense by ID."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
    deleted = cursor.rowcount > 0
    
    conn.commit()
    conn.close()
    
    return deleted
