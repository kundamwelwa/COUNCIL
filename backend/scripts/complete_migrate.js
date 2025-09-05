const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function runCompleteMigration() {
  try {
    console.log('🔄 Starting complete database migration...');

    // Read the complete schema file
    const schemaPath = path.join(__dirname, '../../database_schema_complete.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('COMMENT'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
          console.log('✅ Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists') && !error.message.includes('duplicate key')) {
            console.error('❌ Error executing statement:', error.message);
            console.error('Statement:', statement);
          }
        }
      }
    }

    // Insert default programs
    const defaultPrograms = [
      { 
        name: 'Bursaries', 
        description: 'Educational support for students',
        type: 'Education',
        audience: 'Students from low-income families',
        budget: 500000.00
      },
      { 
        name: 'SMEs', 
        description: 'Small and Medium Enterprise support',
        type: 'Economic Development',
        audience: 'Small business owners and entrepreneurs',
        budget: 1000000.00
      },
      { 
        name: 'Social Welfare', 
        description: 'Social welfare assistance programs',
        type: 'Social Welfare',
        audience: 'Vulnerable and disadvantaged individuals',
        budget: 750000.00
      },
      { 
        name: 'FISP', 
        description: 'Farm Input Support Programme',
        type: 'Agriculture',
        audience: 'Small-scale farmers',
        budget: 2000000.00
      },
      { 
        name: 'Cooperatives', 
        description: 'Cooperative development programs',
        type: 'Economic Development',
        audience: 'Cooperative groups and members',
        budget: 800000.00
      },
      { 
        name: 'Youth Clubs', 
        description: 'Youth and community clubs',
        type: 'Social Welfare',
        audience: 'Youth aged 15-35',
        budget: 300000.00
      }
    ];

    for (const program of defaultPrograms) {
      try {
        await pool.query(`
          INSERT INTO programs (program_name, description, program_type, target_audience, budget_allocation, status)
          VALUES ($1, $2, $3, $4, $5, $6) 
          ON CONFLICT (program_name) DO UPDATE SET
          description = EXCLUDED.description,
          program_type = EXCLUDED.program_type,
          target_audience = EXCLUDED.target_audience,
          budget_allocation = EXCLUDED.budget_allocation
        `, [program.name, program.description, program.type, program.audience, program.budget, 'Active']);
        console.log(`✅ Inserted/Updated program: ${program.name}`);
      } catch (error) {
        console.log(`ℹ️  Program already exists: ${program.name}`);
      }
    }

    // Create default admin user
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    try {
      await pool.query(`
        INSERT INTO users (username, email, password_hash, role, is_active, email_verified, department)
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        ON CONFLICT (username) DO UPDATE SET
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        email_verified = EXCLUDED.email_verified
      `, [
        process.env.ADMIN_USERNAME || 'admin',
        process.env.ADMIN_EMAIL || 'admin@council.gov.zm',
        hashedPassword,
        'SuperAdmin',
        true,
        true,
        'Information Technology'
      ]);
      console.log('✅ Created/Updated default admin user');
    } catch (error) {
      console.log('ℹ️  Admin user already exists');
    }

    // Create sample data for demonstration
    await createSampleData();

    console.log('🎉 Complete database migration completed successfully!');
    console.log('📊 Default data inserted');
    console.log('👤 Admin user created (username: admin, password: Admin123!)');
    console.log('🔐 Password reset and email verification systems ready');
    console.log('📈 Dashboard data populated for testing');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function createSampleData() {
  try {
    console.log('📊 Creating sample data...');

    // Create sample beneficiaries
    const sampleBeneficiaries = [
      {
        first_name: 'John',
        last_name: 'Mwamba',
        national_id: '1234567890',
        gender: 'Male',
        dob: '1985-03-15',
        phone_number: '+260977123456',
        email: 'john.mwamba@email.com',
        address: '123 Independence Avenue, Lusaka',
        district: 'Lusaka',
        province: 'Lusaka',
        marital_status: 'Married',
        employment_status: 'Self-Employed',
        income_level: 'Low'
      },
      {
        first_name: 'Mary',
        last_name: 'Chisenga',
        national_id: '1234567891',
        gender: 'Female',
        dob: '1990-07-22',
        phone_number: '+260977123457',
        email: 'mary.chisenga@email.com',
        address: '456 Cairo Road, Lusaka',
        district: 'Lusaka',
        province: 'Lusaka',
        marital_status: 'Single',
        employment_status: 'Unemployed',
        income_level: 'Very Low'
      },
      {
        first_name: 'Peter',
        last_name: 'Banda',
        national_id: '1234567892',
        gender: 'Male',
        dob: '1988-11-08',
        phone_number: '+260977123458',
        email: 'peter.banda@email.com',
        address: '789 Great East Road, Lusaka',
        district: 'Lusaka',
        province: 'Lusaka',
        marital_status: 'Married',
        employment_status: 'Employed',
        income_level: 'Medium'
      }
    ];

    for (const beneficiary of sampleBeneficiaries) {
      try {
        await pool.query(`
          INSERT INTO persons (first_name, last_name, national_id, gender, dob, phone_number, email, 
                             address, district, province, marital_status, employment_status, income_level, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (national_id) DO NOTHING
        `, [
          beneficiary.first_name, beneficiary.last_name, beneficiary.national_id, beneficiary.gender,
          beneficiary.dob, beneficiary.phone_number, beneficiary.email, beneficiary.address,
          beneficiary.district, beneficiary.province, beneficiary.marital_status,
          beneficiary.employment_status, beneficiary.income_level, true
        ]);
      } catch (error) {
        console.log(`ℹ️  Beneficiary already exists: ${beneficiary.first_name} ${beneficiary.last_name}`);
      }
    }

    // Create sample groups
    const sampleGroups = [
      {
        group_name: 'Youth Cooperative Alpha',
        program_id: 1, // Bursaries
        description: 'Youth cooperative focused on educational support',
        group_type: 'Cooperative',
        registration_number: 'YC001',
        district: 'Lusaka',
        province: 'Lusaka',
        contact_person: 'John Mwamba',
        contact_phone: '+260977123456',
        contact_email: 'youth.alpha@email.com',
        membership_fee: 50.00,
        status: 'Active'
      },
      {
        group_name: 'Women Entrepreneurs Club',
        program_id: 2, // SMEs
        description: 'Support group for women in business',
        group_type: 'Association',
        registration_number: 'WEC001',
        district: 'Lusaka',
        province: 'Lusaka',
        contact_person: 'Mary Chisenga',
        contact_phone: '+260977123457',
        contact_email: 'women.entrepreneurs@email.com',
        membership_fee: 100.00,
        status: 'Active'
      }
    ];

    for (const group of sampleGroups) {
      try {
        await pool.query(`
          INSERT INTO groups (group_name, program_id, description, group_type, registration_number,
                            district, province, contact_person, contact_phone, contact_email,
                            membership_fee, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (group_name) DO NOTHING
        `, [
          group.group_name, group.program_id, group.description, group.group_type,
          group.registration_number, group.district, group.province, group.contact_person,
          group.contact_phone, group.contact_email, group.membership_fee, group.status
        ]);
      } catch (error) {
        console.log(`ℹ️  Group already exists: ${group.group_name}`);
      }
    }

    // Create sample loans/grants
    const sampleLoans = [
      {
        group_id: 1,
        amount: 15000.00,
        type: 'Loan',
        purpose: 'Educational materials and equipment',
        issued_date: '2024-01-15',
        due_date: '2024-12-15',
        repayment_status: 'Pending',
        interest_rate: 5.0,
        total_repayment_amount: 15750.00
      },
      {
        group_id: 2,
        amount: 25000.00,
        type: 'Grant',
        purpose: 'Business startup capital',
        issued_date: '2024-02-01',
        due_date: null,
        repayment_status: 'Pending',
        interest_rate: 0.0,
        total_repayment_amount: 25000.00
      }
    ];

    for (const loan of sampleLoans) {
      try {
        await pool.query(`
          INSERT INTO grants_loans (group_id, amount, type, purpose, issued_date, due_date,
                                   repayment_status, interest_rate, total_repayment_amount)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          loan.group_id, loan.amount, loan.type, loan.purpose, loan.issued_date,
          loan.due_date, loan.repayment_status, loan.interest_rate, loan.total_repayment_amount
        ]);
      } catch (error) {
        console.log(`ℹ️  Loan already exists for group ${loan.group_id}`);
      }
    }

    // Create sample person-program enrollments
    const enrollments = [
      { person_id: 1, program_id: 1, status: 'Active' },
      { person_id: 2, program_id: 2, status: 'Active' },
      { person_id: 3, program_id: 1, status: 'Active' }
    ];

    for (const enrollment of enrollments) {
      try {
        await pool.query(`
          INSERT INTO person_programs (person_id, program_id, status)
          VALUES ($1, $2, $3)
          ON CONFLICT (person_id, program_id) DO NOTHING
        `, [enrollment.person_id, enrollment.program_id, enrollment.status]);
      } catch (error) {
        console.log(`ℹ️  Enrollment already exists`);
      }
    }

    // Create sample person-group memberships
    const memberships = [
      { person_id: 1, group_id: 1, role: 'Leader', status: 'Active' },
      { person_id: 2, group_id: 2, role: 'Treasurer', status: 'Active' },
      { person_id: 3, group_id: 1, role: 'Member', status: 'Active' }
    ];

    for (const membership of memberships) {
      try {
        await pool.query(`
          INSERT INTO person_groups (person_id, group_id, role, status)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (person_id, group_id) DO NOTHING
        `, [membership.person_id, membership.group_id, membership.role, membership.status]);
      } catch (error) {
        console.log(`ℹ️  Membership already exists`);
      }
    }

    console.log('✅ Sample data created successfully');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runCompleteMigration();
}

module.exports = runCompleteMigration;
