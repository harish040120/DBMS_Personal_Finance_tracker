import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const createConnection = async () => {
  try {
    return await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Muthu@4254',
      database: process.env.DB_NAME || 'finance_tracker',
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

// Create database and tables if they don't exist
const initializeDatabase = async () => {
  try {
    // First connect without database to create it if it doesn't exist
    const initialConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Muthu@4254',
    });

    await initialConnection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'finance_tracker'}`);
    await initialConnection.end();

    // Now connect with the database
    const connection = await createConnection();

    // Create User table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS User (
        User_ID INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(100) NOT NULL,
        Email VARCHAR(100) UNIQUE NOT NULL,
        Password VARCHAR(255) NOT NULL,
        Phone VARCHAR(20)
      )
    `);

    // Create Category table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Category (
        Category_ID INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(50) NOT NULL,
        User_ID INT,
        FOREIGN KEY (User_ID) REFERENCES User(User_ID)
      )
    `);

    // Create Account table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Account (
        Account_ID INT AUTO_INCREMENT PRIMARY KEY,
        User_ID INT,
        Account_Name VARCHAR(100) NOT NULL,
        Balance DECIMAL(10,2) DEFAULT 0.00,
        FOREIGN KEY (User_ID) REFERENCES User(User_ID)
      )
    `);

    // Create Transaction table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Transaction (
        Transaction_ID INT AUTO_INCREMENT PRIMARY KEY,
        User_ID INT,
        Amount DECIMAL(10,2) NOT NULL,
        Date DATETIME NOT NULL,
        Note VARCHAR(255),
        Category_ID INT,
        Account_ID INT,
        Transaction_Type VARCHAR(20) NOT NULL,
        FOREIGN KEY (User_ID) REFERENCES User(User_ID),
        FOREIGN KEY (Category_ID) REFERENCES Category(Category_ID),
        FOREIGN KEY (Account_ID) REFERENCES Account(Account_ID)
      )
    `);

    // Create Goal table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Goal (
        Goal_ID INT AUTO_INCREMENT PRIMARY KEY,
        User_ID INT,
        Goal_Name VARCHAR(100) NOT NULL,
        Target_Amount DECIMAL(10,2) NOT NULL,
        Saved_Amount DECIMAL(10,2) DEFAULT 0.00,
        Deadline DATE,
        FOREIGN KEY (User_ID) REFERENCES User(User_ID)
      )
    `);

    // Create Budget table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Budget (
        Budget_ID INT AUTO_INCREMENT PRIMARY KEY,
        User_ID INT,
        Category_ID INT,
        Budget_Amount DECIMAL(10,2) NOT NULL,
        Start_Date DATE NOT NULL,
        End_Date DATE NOT NULL,
        FOREIGN KEY (User_ID) REFERENCES User(User_ID),
        FOREIGN KEY (Category_ID) REFERENCES Category(Category_ID)
      )
    `);

    // Create RecurringTransaction table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS RecurringTransaction (
        Recurring_ID INT AUTO_INCREMENT PRIMARY KEY,
        Account_ID INT,
        Category_ID INT,
        User_ID INT,
        Frequency VARCHAR(20) NOT NULL,
        Next_Due_Date DATE NOT NULL,
        Amount DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (Account_ID) REFERENCES Account(Account_ID),
        FOREIGN KEY (Category_ID) REFERENCES Category(Category_ID),
        FOREIGN KEY (User_ID) REFERENCES User(User_ID)
      )
    `);

    // Create CompositeInvestmentCalculation table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS CompositeInvestmentCalculation (
        Calculation_ID INT AUTO_INCREMENT PRIMARY KEY,
        User_ID INT,
        Investment_Amount DECIMAL(10,2) NOT NULL,
        Expected_Return DECIMAL(5,2) NOT NULL,
        Investment_Type VARCHAR(50) NOT NULL,
        Total_Return DECIMAL(10,2) NOT NULL,
        Calculation_Date DATE NOT NULL,
        FOREIGN KEY (User_ID) REFERENCES User(User_ID)
      )
    `);

    // Create FixedDepositCalculation table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS FixedDepositCalculation (
        Calculation_ID INT AUTO_INCREMENT PRIMARY KEY,
        User_ID INT,
        Principal_Amount DECIMAL(10,2) NOT NULL,
        Interest_Rate DECIMAL(5,2) NOT NULL,
        Tenure_Years INT NOT NULL,
        Maturity_Amount DECIMAL(10,2) NOT NULL,
        Calculation_Date DATE NOT NULL,
        FOREIGN KEY (User_ID) REFERENCES User(User_ID)
      )
    `);

    // Create Notification table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Notification (
        Notification_ID INT AUTO_INCREMENT PRIMARY KEY,
        User_ID INT,
        Message VARCHAR(255) NOT NULL,
        Timestamp DATETIME NOT NULL,
        Is_Read BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (User_ID) REFERENCES User(User_ID)
      )
    `);

    // Create MonthlyReport table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS MonthlyReport (
        Report_ID INT AUTO_INCREMENT PRIMARY KEY,
        Generated_By_User_ID INT,
        Report_Date DATE NOT NULL,
        Report_Content TEXT NOT NULL,
        FOREIGN KEY (Generated_By_User_ID) REFERENCES User(User_ID)
      )
    `);

    // Insert default categories for testing
    const [categories] = await connection.query('SELECT * FROM Category');
    if (!Array.isArray(categories) || categories.length === 0) {
      await connection.query(`
        INSERT INTO Category (Name) VALUES
        ('Food'),
        ('Transportation'),
        ('Entertainment'),
        ('Shopping'),
        ('Utilities'),
        ('Housing'),
        ('Income'),
        ('Other')
      `);
    }

    await connection.end();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};

// API Routes
// Get all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const connection = await createConnection();
    
    const [rows] = await connection.query(`
      SELECT t.Transaction_ID, t.Amount, t.Date, t.Note, 
             c.Name as Category, a.Account_Name, t.Transaction_Type
      FROM Transaction t
      LEFT JOIN Category c ON t.Category_ID = c.Category_ID
      LEFT JOIN Account a ON t.Account_ID = a.Account_ID
      ORDER BY t.Date DESC
    `);
    
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Add a new transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const { amount, date, note, category, account, transactionType } = req.body;
    
    const connection = await createConnection();
    
    // Get category id
    const [categories] = await connection.query(
      'SELECT Category_ID FROM Category WHERE Name = ?',
      [category]
    );
    
    if (!categories.length) {
      await connection.end();
      return res.status(400).json({ error: 'Invalid category' });
    }
    
    // Get account id
    const [accounts] = await connection.query(
      'SELECT Account_ID FROM Account WHERE Account_Name = ?',
      [account]
    );
    
    if (!accounts.length) {
      await connection.end();
      return res.status(400).json({ error: 'Invalid account' });
    }
    
    // Insert transaction
    const [result] = await connection.query(
      `INSERT INTO Transaction 
       (Amount, Date, Note, Category_ID, Account_ID, Transaction_Type, User_ID)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [amount, date, note, categories[0].Category_ID, accounts[0].Account_ID, transactionType]
    );
    
    // Update account balance
    await connection.query(
      'UPDATE Account SET Balance = Balance + ? WHERE Account_ID = ?',
      [amount, accounts[0].Account_ID]
    );
    
    await connection.end();
    res.status(201).json({ 
      id: result.insertId,
      amount,
      date,
      note,
      category,
      account,
      transactionType
    });
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ error: 'Failed to add transaction' });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const connection = await createConnection();
    const [rows] = await connection.query('SELECT * FROM Category');
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all accounts
app.get('/api/accounts', async (req, res) => {
  try {
    const connection = await createConnection();
    const [rows] = await connection.query('SELECT * FROM Account');
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Get dashboard data
app.get('/api/dashboard', async (req, res) => {
  try {
    const connection = await createConnection();
    
    // Get total balance across all accounts
    const [balanceResult] = await connection.query(
      'SELECT SUM(Balance) as total_balance FROM Account'
    );
    
    // Get recent transactions
    const [recentTransactions] = await connection.query(`
      SELECT t.Transaction_ID, t.Amount, t.Date, t.Note,
             c.Name as Category, a.Account_Name, t.Transaction_Type
      FROM Transaction t
      LEFT JOIN Category c ON t.Category_ID = c.Category_ID
      LEFT JOIN Account a ON t.Account_ID = a.Account_ID
      ORDER BY t.Date DESC
      LIMIT 5
    `);
    
    // Get category-wise spending
    const [categorySpending] = await connection.query(`
      SELECT c.Name, SUM(ABS(t.Amount)) as total
      FROM Transaction t
      JOIN Category c ON t.Category_ID = c.Category_ID
      WHERE t.Amount < 0
      GROUP BY c.Category_ID
      ORDER BY total DESC
      LIMIT 5
    `);
    
    // Get monthly summary
    const [monthlySummary] = await connection.query(`
      SELECT 
        DATE_FORMAT(Date, '%Y-%m') as month,
        SUM(CASE WHEN Amount > 0 THEN Amount ELSE 0 END) as income,
        SUM(CASE WHEN Amount < 0 THEN ABS(Amount) ELSE 0 END) as expense
      FROM Transaction
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `);
    
    await connection.end();
    
    res.json({
      balance: balanceResult[0].total_balance || 0,
      recentTransactions,
      categorySpending,
      monthlySummary
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Start server after initializing database
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
  });