#!/usr/bin/env python3
"""
MyFinance - A personal finance tracking application.
"""

import sys
from datetime import datetime, timedelta
from database import init_db, add_expense, get_categories, get_expenses, get_summary, delete_expense


def print_header():
    """Print the application header."""
    print("\n" + "=" * 50)
    print("       MyFinance - Expense Tracker")
    print("=" * 50)


def print_menu():
    """Print the main menu."""
    print("\n--- Main Menu ---")
    print("1. Add Expense")
    print("2. View Recent Expenses")
    print("3. View Summary")
    print("4. View Expenses by Category")
    print("5. Delete Expense")
    print("6. Exit")
    print("-" * 20)


def select_category() -> int:
    """Display categories and get user selection."""
    categories = get_categories()
    
    print("\n--- Categories ---")
    for cat in categories:
        print(f"  {cat['id']}. {cat['name']}")
    
    while True:
        try:
            choice = int(input("\nSelect category number: "))
            if any(cat['id'] == choice for cat in categories):
                return choice
            print("Invalid category. Please try again.")
        except ValueError:
            print("Please enter a number.")


def add_expense_flow():
    """Handle adding a new expense."""
    print("\n--- Add New Expense ---")
    
    # Get amount
    while True:
        try:
            amount = float(input("Amount: $"))
            if amount <= 0:
                print("Amount must be positive.")
                continue
            break
        except ValueError:
            print("Please enter a valid number.")
    
    # Get category
    category_id = select_category()
    
    # Get description
    description = input("Description (optional): ").strip() or None
    
    # Get date
    date_input = input("Date (YYYY-MM-DD, or press Enter for today): ").strip()
    if date_input:
        try:
            datetime.strptime(date_input, "%Y-%m-%d")
            date = date_input
        except ValueError:
            print("Invalid date format. Using today's date.")
            date = None
    else:
        date = None
    
    # Add the expense
    expense_id = add_expense(amount, category_id, description, date)
    print(f"\n✓ Expense #{expense_id} added successfully!")


def view_expenses_flow(category_id: int = None):
    """Display recent expenses."""
    if category_id:
        categories = get_categories()
        cat_name = next((c['name'] for c in categories if c['id'] == category_id), "Unknown")
        print(f"\n--- Expenses: {cat_name} ---")
    else:
        print("\n--- Recent Expenses ---")
    
    expenses = get_expenses(limit=20, category_id=category_id)
    
    if not expenses:
        print("No expenses found.")
        return
    
    print(f"\n{'ID':<6} {'Date':<12} {'Category':<18} {'Amount':>10}  Description")
    print("-" * 70)
    
    for exp in expenses:
        desc = (exp['description'][:20] + "...") if exp['description'] and len(exp['description']) > 20 else (exp['description'] or "")
        print(f"{exp['id']:<6} {exp['date']:<12} {exp['category']:<18} ${exp['amount']:>9.2f}  {desc}")
    
    print("-" * 70)
    total = sum(exp['amount'] for exp in expenses)
    print(f"{'Total:':<38} ${total:>9.2f}")


def view_by_category_flow():
    """View expenses filtered by category."""
    category_id = select_category()
    view_expenses_flow(category_id)


def view_summary_flow():
    """Display expense summary."""
    print("\n--- Expense Summary ---")
    print("1. This Month")
    print("2. Last Month")
    print("3. This Year")
    print("4. All Time")
    
    choice = input("\nSelect period: ").strip()
    
    today = datetime.now()
    start_date = None
    end_date = None
    period_name = "All Time"
    
    if choice == "1":
        start_date = today.replace(day=1).strftime("%Y-%m-%d")
        period_name = "This Month"
    elif choice == "2":
        first_of_month = today.replace(day=1)
        last_month_end = first_of_month - timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)
        start_date = last_month_start.strftime("%Y-%m-%d")
        end_date = last_month_end.strftime("%Y-%m-%d")
        period_name = "Last Month"
    elif choice == "3":
        start_date = today.replace(month=1, day=1).strftime("%Y-%m-%d")
        period_name = "This Year"
    
    summary = get_summary(start_date, end_date)
    
    print(f"\n--- Summary: {period_name} ---")
    print(f"\n{'Category':<25} {'Count':>8} {'Total':>12}")
    print("-" * 47)
    
    for item in summary['by_category']:
        print(f"{item['category']:<25} {item['count']:>8} ${item['total']:>11.2f}")
    
    print("-" * 47)
    print(f"{'TOTAL':<25} {'':<8} ${summary['total']:>11.2f}")


def delete_expense_flow():
    """Handle deleting an expense."""
    view_expenses_flow()
    
    try:
        expense_id = int(input("\nEnter expense ID to delete (0 to cancel): "))
        if expense_id == 0:
            print("Cancelled.")
            return
        
        confirm = input(f"Delete expense #{expense_id}? (y/n): ").strip().lower()
        if confirm == 'y':
            if delete_expense(expense_id):
                print(f"✓ Expense #{expense_id} deleted.")
            else:
                print("Expense not found.")
        else:
            print("Cancelled.")
    except ValueError:
        print("Invalid ID.")


def main():
    """Main entry point for the application."""
    # Initialize database
    init_db()
    
    print_header()
    
    while True:
        print_menu()
        choice = input("Select option: ").strip()
        
        if choice == "1":
            add_expense_flow()
        elif choice == "2":
            view_expenses_flow()
        elif choice == "3":
            view_summary_flow()
        elif choice == "4":
            view_by_category_flow()
        elif choice == "5":
            delete_expense_flow()
        elif choice == "6":
            print("\nGoodbye! Keep tracking your expenses!")
            sys.exit(0)
        else:
            print("Invalid option. Please try again.")


if __name__ == "__main__":
    main()
