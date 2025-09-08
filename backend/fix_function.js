const pool = require('./config/database');

async function fixFunction() {
  try {
    console.log('🔄 Fixing get_user_permissions function...');
    
    const query = `
      CREATE OR REPLACE FUNCTION get_user_permissions(user_role VARCHAR)
      RETURNS TABLE(permission VARCHAR) AS $$
      BEGIN
          -- Return permissions based on user role
          IF user_role IN ('SuperAdmin', 'Admin', 'DataEntry') THEN
              RETURN QUERY SELECT 'manage_beneficiaries'::VARCHAR;
          END IF;
          
          IF user_role IN ('SuperAdmin', 'Admin') THEN
              RETURN QUERY SELECT 'manage_programs'::VARCHAR;
          END IF;
          
          IF user_role IN ('SuperAdmin', 'Admin', 'DataEntry') THEN
              RETURN QUERY SELECT 'manage_groups'::VARCHAR;
          END IF;
          
          IF user_role IN ('SuperAdmin', 'Admin') THEN
              RETURN QUERY SELECT 'manage_loans'::VARCHAR;
          END IF;
          
          IF user_role IN ('SuperAdmin', 'Admin', 'DataEntry', 'Auditor') THEN
              RETURN QUERY SELECT 'view_reports'::VARCHAR;
          END IF;
          
          IF user_role = 'SuperAdmin' THEN
              RETURN QUERY SELECT 'manage_users'::VARCHAR;
              RETURN QUERY SELECT 'system_settings'::VARCHAR;
          END IF;
          
          RETURN;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    await pool.query(query);
    console.log('✅ Function recreated successfully');
    
    // Test the function
    const testResult = await pool.query("SELECT permission FROM get_user_permissions('SuperAdmin')");
    console.log('🔍 Test result:', testResult.rows);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

fixFunction();
