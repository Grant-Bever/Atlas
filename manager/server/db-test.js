// Simple database connection test script
const { Client } = require('pg');

async function testConnection() {
  console.log('Testing direct PostgreSQL connection...');
  
  // Create configuration for connection
  const config = {
    user: 'postgres',
    password: process.env.DB_PASS,
    database: 'atlas-db',
    host: process.env.DB_HOST || '/cloudsql/atlas-planner:us-east1:atlas-db',
    // For Unix socket connections
    ssl: false
  };
  
  console.log(`Connecting to database with config: ${JSON.stringify({
    ...config,
    password: '***HIDDEN***' // Hide password in logs
  })}`);

  const client = new Client(config);
  
  try {
    // Connect to the database
    await client.connect();
    console.log('Connection successful!');
    
    // Try a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`Current database time: ${result.rows[0].current_time}`);
    
    // Close connection
    await client.end();
    console.log('Connection closed.');
    
    return true;
  } catch (error) {
    console.error('Connection failed:', error);
    return false;
  }
}

// Run the test
testConnection().then(success => {
  console.log(`Connection test ${success ? 'PASSED' : 'FAILED'}`);
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
}); 