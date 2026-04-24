#!/usr/bin/env python3
"""
Manual User Creation Script for SchoolOS

This script allows you to manually create user accounts in Supabase Auth
with encrypted passwords and profile information.

Prerequisites:
- pip install supabase

Usage:
1. Set your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
2. Run: python create_users.py

The service role key is required for server-side operations like creating users.
You can find it in your Supabase dashboard under Settings > API.
"""

import os
import sys
from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')  # Service role key for admin operations

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("Error: Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def create_user(email: str, password: str, full_name: str, role: str = 'staff', department: str = None):
    """
    Create a new user account with profile information.

    Args:
        email: User's email address
        password: Plain text password (will be hashed by Supabase)
        full_name: User's full name
        role: User role ('admin', 'teacher', 'staff')
        department: User's department
    """
    try:
        # Create the user in auth.users
        auth_response = supabase.auth.admin.create_user({
            'email': email,
            'password': password,
            'email_confirm': True,  # Auto-confirm email for manual creation
            'user_metadata': {
                'full_name': full_name,
                'role': role,
                'department': department
            }
        })

        if auth_response.user:
            user_id = auth_response.user.id
            print(f"✓ Created auth user: {email} (ID: {user_id})")

            # Create profile record
            profile_data = {
                'id': user_id,
                'email': email,
                'full_name': full_name,
                'role': role,
                'department': department
            }

            profile_response = supabase.table('profiles').insert(profile_data).execute()

            if profile_response.data:
                print(f"✓ Created profile for: {email}")
                return True
            else:
                print(f"✗ Failed to create profile for: {email}")
                return False
        else:
            print(f"✗ Failed to create auth user: {email}")
            return False

    except Exception as e:
        print(f"✗ Error creating user {email}: {str(e)}")
        return False

def main():
    print("SchoolOS Manual User Creation")
    print("=" * 40)

    # Example users - modify as needed
    users_to_create = [
        {
            'email': 'admin@schoolos.com',
            'password': 'AdminPass123!',
            'full_name': 'School Administrator',
            'role': 'admin',
            'department': 'Administration'
        },
        {
            'email': 'teacher@schoolos.com',
            'password': 'TeacherPass123!',
            'full_name': 'John Smith',
            'role': 'teacher',
            'department': 'Mathematics'
        },
        {
            'email': 'staff@schoolos.com',
            'password': 'StaffPass123!',
            'full_name': 'Jane Doe',
            'role': 'staff',
            'department': 'Operations'
        }
    ]

    print(f"Creating {len(users_to_create)} users...")
    print()

    success_count = 0
    for user in users_to_create:
        if create_user(**user):
            success_count += 1
        print()

    print(f"✓ Successfully created {success_count}/{len(users_to_create)} users")

    if success_count > 0:
        print("\nUsers can now log in at /login with their email and password.")
        print("Passwords are automatically encrypted by Supabase.")

if __name__ == '__main__':
    main()