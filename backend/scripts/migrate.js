const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...');

    // Read the schema file
    const schemaPath = path.join(__dirname, '../../database_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
          console.log('✅ Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists')) {
            console.error('❌ Error executing statement:', error.message);
            console.error('Statement:', statement);
          }
        }
      }
    }

    // Insert default programs
    const defaultPrograms = [
      { name: 'Bursaries', description: 'Educational support for students' },
      { name: 'SMEs', description: 'Small and Medium Enterprise support' },
      { name: 'Social Welfare', description: 'Social welfare assistance programs' },
      { name: 'FISP', description: 'Farm Input Support Programme' },
      { name: 'Cooperatives', description: 'Cooperative development programs' },
      { name: 'Clubs', description: 'Youth and community clubs' }
    ];

    for (const program of defaultPrograms) {
      try {
        await pool.query(
          'INSERT INTO programs (program_name, description) VALUES ($1, $2) ON CONFLICT (program_name) DO NOTHING',
          [program.name, program.description]
        );
        console.log(`✅ Inserted program: ${program.name}`);
      } catch (error) {
        console.log(`ℹ️  Program already exists: ${program.name}`);
      }
    }

    // Create default admin user
    const bcrypt = require('bcryptjs');
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    try {
      await pool.query(
        `INSERT INTO users (username, email, password_hash, role) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (username) DO NOTHING`,
        [
          process.env.ADMIN_USERNAME || 'admin',
          process.env.ADMIN_EMAIL || 'admin@council.gov.zm',
          hashedPassword,
          'SuperAdmin'
        ]
      );
      console.log('✅ Created default admin user');
    } catch (error) {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('🎉 Database migrations completed successfully!');
    console.log('📊 Default data inserted');
    console.log('👤 Admin user created (username: admin, password: admin123)');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
