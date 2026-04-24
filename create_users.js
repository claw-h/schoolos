#!/usr/bin/env node
/**
 * Manual User Creation Script for SchoolOS
 *
 * This script allows you to manually create user accounts in Supabase Auth
 * with encrypted passwords and profile information.
 *
 * Prerequisites:
 * - npm install @supabase/supabase-js
 *
 * Usage:
 * 1. Set your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 * 2. Run: node create_users.js
 *
 * The service role key is required for server-side operations like creating users.
 * You can find it in your Supabase dashboard under Settings > API.
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key for admin operations

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createUser(email, password, fullName, role = 'staff', department = null) {
  /**
   * Create a new user account with profile information.
   *
   * Args:
   *   email: User's email address
   *   password: Plain text password (will be hashed by Supabase)
   *   fullName: User's full name
   *   role: User role ('admin', 'teacher', 'staff')
   *   department: User's department
   */
  try {
    // Create the user in auth.users
    const authResponse = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email for manual creation
      user_metadata: {
        full_name: fullName,
        role: role,
        department: department
      }
    });

    if (authResponse.data.user) {
      const userId = authResponse.data.user.id;
      console.log(`✓ Created auth user: ${email} (ID: ${userId})`);

      // Create profile record
      const profileData = {
        id: userId,
        email: email,
        full_name: fullName,
        role: role,
        department: department
      };

      const profileResponse = await supabase
        .from('profiles')
        .insert(profileData)
        .select();

      if (profileResponse.error) {
        console.error(`✗ Failed to create profile for: ${email}`, profileResponse.error);
        return false;
      } else {
        console.log(`✓ Created profile for: ${email}`);
        return true;
      }
    } else {
      console.error(`✗ Failed to create auth user: ${email}`, authResponse.error);
      return false;
    }

  } catch (error) {
    console.error(`✗ Error creating user ${email}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('SchoolOS Manual User Creation');
  console.log('='.repeat(40));

  // Example users - modify as needed
  const usersToCreate = [
    {
      email: 'admin@schoolos.com',
      password: 'AdminPass123!',
      fullName: 'School Administrator',
      role: 'admin',
      department: 'Administration'
    },
    {
      email: 'teacher@schoolos.com',
      password: 'TeacherPass123!',
      fullName: 'John Smith',
      role: 'teacher',
      department: 'Mathematics'
    },
    {
      email: 'staff@schoolos.com',
      password: 'StaffPass123!',
      fullName: 'Jane Doe',
      role: 'staff',
      department: 'Operations'
    }
  ];

  console.log(`Creating ${usersToCreate.length} users...`);
  console.log();

  let successCount = 0;
  for (const user of usersToCreate) {
    if (await createUser(user.email, user.password, user.fullName, user.role, user.department)) {
      successCount++;
    }
    console.log();
  }

  console.log(`✓ Successfully created ${successCount}/${usersToCreate.length} users`);

  if (successCount > 0) {
    console.log('\nUsers can now log in at /login with their email and password.');
    console.log('Passwords are automatically encrypted by Supabase.');
  }
}

main().catch(console.error);