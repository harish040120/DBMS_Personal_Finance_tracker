import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database connection
const createConnection = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Muthu@4254',
    database: process.env.DB_NAME || 'finance_tracker',
  });
};

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
    
    // Create Category table with color
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Category (
        Category_ID INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(50) NOT NULL,
        Color VARCHAR(20) DEFAULT '#4F4F4F',
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
    
    // Create Transaction table with proper balance handling
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
    
    // Create other tables (keeping existing structure)
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
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS MonthlyReport (
        Report_ID INT AUTO_INCREMENT PRIMARY KEY,
        Generated_By_User_ID INT,
        Report_Date DATE NOT NULL,
        Report_Content TEXT NOT NULL,
        FOREIGN KEY (Generated_By_User_ID) REFERENCES User(User_ID)
      )
    `);
    
    // Ensure default user exists
    const [users] = await connection.query('SELECT User_ID FROM User WHERE User_ID = 1');
    if (!users.length) {
      await connection.query(`
        INSERT INTO User (User_ID, Name, Email, Password, Phone) 
        VALUES (1, 'Default User', 'default@example.com', 'password123', '1234567890')
      `);
    }
    
    // Insert default categories with colors for testing
    const [categories] = await connection.query('SELECT * FROM Category');
    if (!Array.isArray(categories) || categories.length === 0) {
      await connection.query(`
        INSERT INTO Category (Name, Color, User_ID) VALUES
        ('Food', '#FF6B6B', 1),
        ('Transportation', '#4ECDC4', 1),
        ('Entertainment', '#45B7D1', 1),
        ('Shopping', '#9C27B0', 1),
        ('Utilities', '#FFEB3B', 1),
        ('Housing', '#2196F3', 1),
        ('Salary', '#2E7D32', 1),
        ('Other', '#4F4F4F', 1)
      `);
    }
    
    // Insert default accounts if none exist
    const [accounts] = await connection.query('SELECT * FROM Account');
    if (!Array.isArray(accounts) || accounts.length === 0) {
      await connection.query(`
        INSERT INTO Account (Account_Name, Balance, User_ID) VALUES
        ('Cash', 1000.00, 1),
        ('Bank Account', 5000.00, 1),
        ('Credit Card', 0.00, 1)
      `);
    }
    
    await connection.end();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};

// Get all transactions with proper formatting
app.get('/api/transactions', async (req, res) => {
  try {
    const connection = await createConnection();
    const [rows] = await connection.query(`
      SELECT 
        t.Transaction_ID,
        t.Amount,
        t.Date,
        t.Note,
        c.Name as Category_Name,
        t.Transaction_Type,
        t.Account_ID,
        a.Account_Name
      FROM Transaction t
      LEFT JOIN Category c ON t.Category_ID = c.Category_ID
      LEFT JOIN Account a ON t.Account_ID = a.Account_ID
      ORDER BY t.Date DESC
    `);
    await connection.end();
    
    // Format the response to match frontend expectations
    const formattedRows = rows.map(row => ({
      id: row.Transaction_ID,
      amount: row.Amount, // Keep original amount from database
      date: row.Date,
      description: row.Note || '',
      category: row.Category_Name || 'Other',
      accountId: row.Account_ID,
      accountName: row.Account_Name,
      transactionType: row.Transaction_Type
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Add new transaction with balance update
app.post('/api/transactions', async (req, res) => {
  try {
    const { amount, date, note, category, accountId, transactionType } = req.body;
    
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
    
    // Validate account exists
    const [accounts] = await connection.query(
      'SELECT Account_ID FROM Account WHERE Account_ID = ?',
      [accountId]
    );
    if (!accounts.length) {
      await connection.end();
      return res.status(400).json({ error: 'Invalid account' });
    }
    
    // Format date properly
    const formattedDate = new Date(date).toISOString().slice(0, 19).replace('T', ' ');
    
    // Start database transaction
    await connection.beginTransaction();
    
    try {
      // Insert transaction - store the raw amount (positive for both income and expense)
      const [result] = await connection.query(
        `INSERT INTO Transaction 
         (Amount, Date, Note, Category_ID, Account_ID, Transaction_Type, User_ID)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [Math.abs(amount), formattedDate, note, categories[0].Category_ID, accountId, transactionType]
      );
      
      // Update account balance based on transaction type
      const balanceAdjustment = transactionType === 'income' ? Math.abs(amount) : -Math.abs(amount);
      await connection.query(
        `UPDATE Account SET Balance = Balance + ? WHERE Account_ID = ?`,
        [balanceAdjustment, accountId]
      );
      
      await connection.commit();
      
      res.status(201).json({ 
        id: result.insertId,
        amount: Math.abs(amount),
        date,
        description: note,
        category,
        accountId,
        transactionType
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ error: 'Failed to add transaction' });
  }
});

// Update transaction with balance update
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, date, note, category, accountId, transactionType } = req.body;
    
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
    
    // Format date properly
    const formattedDate = new Date(date).toISOString().slice(0, 19).replace('T', ' ');
    
    // Start database transaction
    await connection.beginTransaction();
    
    try {
      // Get original transaction details
      const [original] = await connection.query(
        'SELECT * FROM Transaction WHERE Transaction_ID = ?',
        [id]
      );
      
      if (!original.length) {
        await connection.rollback();
        await connection.end();
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      const oldTx = original[0];
      
      // Calculate balance adjustments
      const oldAdjustment = oldTx.Transaction_Type === 'income' ? 
        oldTx.Amount : -oldTx.Amount;
      const newAdjustment = transactionType === 'income' ? 
        Math.abs(amount) : -Math.abs(amount);
      
      // If account changed, update both accounts
      if (oldTx.Account_ID !== accountId) {
        // Remove old adjustment from old account
        await connection.query(
          `UPDATE Account SET Balance = Balance - ? WHERE Account_ID = ?`,
          [oldAdjustment, oldTx.Account_ID]
        );
        
        // Add new adjustment to new account
        await connection.query(
          `UPDATE Account SET Balance = Balance + ? WHERE Account_ID = ?`,
          [newAdjustment, accountId]
        );
      } else {
        // Same account, calculate the difference
        const balanceDiff = newAdjustment - oldAdjustment;
        await connection.query(
          `UPDATE Account SET Balance = Balance + ? WHERE Account_ID = ?`,
          [balanceDiff, accountId]
        );
      }
      
      // Update transaction record
      await connection.query(
        `UPDATE Transaction SET 
         Amount = ?, Date = ?, Note = ?, Category_ID = ?, 
         Account_ID = ?, Transaction_Type = ?
         WHERE Transaction_ID = ?`,
        [Math.abs(amount), formattedDate, note, categories[0].Category_ID, 
         accountId, transactionType, id]
      );
      
      await connection.commit();
      
      res.status(200).json({ 
        id: parseInt(id),
        amount: Math.abs(amount),
        date,
        description: note,
        category,
        accountId,
        transactionType
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete transaction with balance update
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await createConnection();
    
    // Start database transaction
    await connection.beginTransaction();
    
    try {
      // Get transaction details before deletion
      const [tx] = await connection.query(
        'SELECT * FROM Transaction WHERE Transaction_ID = ?',
        [id]
      );
      
      if (!tx.length) {
        await connection.rollback();
        await connection.end();
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      const transaction = tx[0];
      
      // Calculate balance adjustment (reverse the original transaction)
      const balanceAdjustment = transaction.Transaction_Type === 'income' ? 
        -transaction.Amount : transaction.Amount;
      
      // Update account balance
      await connection.query(
        `UPDATE Account SET Balance = Balance + ? WHERE Account_ID = ?`,
        [balanceAdjustment, transaction.Account_ID]
      );
      
      // Delete transaction
      await connection.query(
        'DELETE FROM Transaction WHERE Transaction_ID = ?',
        [id]
      );
      
      await connection.commit();
      res.status(204).end();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Get all categories with proper formatting
app.get('/api/categories', async (req, res) => {
  try {
    const connection = await createConnection();
    const [rows] = await connection.query(
      'SELECT Category_ID, Name, Color FROM Category ORDER BY Name'
    );
    await connection.end();
    
    const formattedRows = rows.map(row => ({
      id: row.Category_ID,
      name: row.Name,
      color: row.Color
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all accounts with proper formatting
app.get('/api/accounts', async (req, res) => {
  try {
    const connection = await createConnection();
    const [rows] = await connection.query(
      'SELECT Account_ID, Account_Name, Balance FROM Account ORDER BY Account_Name'
    );
    await connection.end();
    
    const formattedRows = rows.map(row => ({
      id: row.Account_ID,
      name: row.Account_Name,
      balance: parseFloat(row.Balance) || 0
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Get dashboard data with proper formatting
app.get('/api/dashboard', async (req, res) => {
  try {
    const connection = await createConnection();
    
    // Get total balance from all accounts
    const [balanceResult] = await connection.query(
      'SELECT SUM(Balance) as total_balance FROM Account'
    );
    
    // Get recent transactions with proper joins
    const [recentTransactions] = await connection.query(`
      SELECT 
        t.Transaction_ID,
        t.Amount,
        t.Date,
        t.Note,
        c.Name as Category_Name,
        t.Transaction_Type,
        t.Account_ID,
        a.Account_Name
      FROM Transaction t
      LEFT JOIN Category c ON t.Category_ID = c.Category_ID
      LEFT JOIN Account a ON t.Account_ID = a.Account_ID
      ORDER BY t.Date DESC
      LIMIT 5
    `);
    
    // Get category-wise spending for current month
    const [categorySpending] = await connection.query(`
      SELECT 
        c.Name,
        c.Color,
        SUM(t.Amount) as total
      FROM Transaction t
      JOIN Category c ON t.Category_ID = c.Category_ID
      WHERE t.Transaction_Type = 'expense'
        AND DATE_FORMAT(t.Date, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')
      GROUP BY c.Category_ID, c.Name, c.Color
      ORDER BY total DESC
      LIMIT 5
    `);
    
    // Get monthly summary for the last 6 months
    const [monthlySummary] = await connection.query(`
      SELECT 
        DATE_FORMAT(Date, '%Y-%m') as month,
        SUM(CASE WHEN Transaction_Type = 'income' THEN Amount ELSE 0 END) as income,
        SUM(CASE WHEN Transaction_Type = 'expense' THEN Amount ELSE 0 END) as expense
      FROM Transaction
      WHERE Date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(Date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 6
    `);
    
    await connection.end();
    
    // Format the response
    const formattedRecentTransactions = recentTransactions.map(t => ({
      id: t.Transaction_ID,
      amount: t.Amount,
      date: t.Date,
      description: t.Note || '',
      category: t.Category_Name || 'Other',
      accountId: t.Account_ID,
      accountName: t.Account_Name,
      transactionType: t.Transaction_Type
    }));
    
    const formattedCategorySpending = categorySpending.map(c => ({
      name: c.Name,
      value: parseFloat(c.total) || 0,
      color: c.Color
    }));
    
    const formattedMonthlySummary = monthlySummary.map(m => ({
      name: m.month,
      income: parseFloat(m.income) || 0,
      expense: parseFloat(m.expense) || 0
    }));
    
    res.json({
      balance: parseFloat(balanceResult[0].total_balance) || 0,
      recentTransactions: formattedRecentTransactions,
      categorySpending: formattedCategorySpending,
      monthlySummary: formattedMonthlySummary
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Reports endpoint (keeping existing implementation but with better formatting)
app.get('/api/reports', async (req, res) => {
  try {
    const { reportType, timeRange } = req.query;
    if (!reportType || !timeRange) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const connection = await createConnection();
    
    // Calculate date range based on timeRange
    const today = new Date();
    let startDate = new Date();
    switch(timeRange) {
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(today.getDate() - 30);
        break;
      case 'quarter':
        startDate.setDate(today.getDate() - 90);
        break;
      case 'year':
        startDate.setDate(today.getDate() - 365);
        break;
      default:
        startDate.setDate(today.getDate() - 30);
    }
    
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = today.toISOString().split('T')[0];
    
    let chartData = [];
    let series = [];
    let categoryData = [];
    let summary = [];
    
    // Generate reports based on type (keeping existing logic)
    if (reportType === 'spending' || reportType === 'income') {
      const [timeSeriesData] = await connection.query(`
        SELECT 
          DATE_FORMAT(Date, '%Y-%m-%d') as name,
          SUM(CASE WHEN Transaction_Type = 'expense' THEN Amount ELSE 0 END) as expense,
          SUM(CASE WHEN Transaction_Type = 'income' THEN Amount ELSE 0 END) as income
        FROM Transaction
        WHERE Date BETWEEN ? AND ?
        GROUP BY DATE_FORMAT(Date, '%Y-%m-%d')
        ORDER BY Date
      `, [formattedStartDate, formattedEndDate]);
      
      chartData = timeSeriesData.map(d => ({
        name: d.name,
        expense: parseFloat(d.expense) || 0,
        income: parseFloat(d.income) || 0
      }));
      series = reportType === 'spending' ? ['expense'] : ['income'];
      
      const [categoryBreakdown] = await connection.query(`
        SELECT 
          c.Name as name,
          SUM(t.Amount) as value
        FROM Transaction t
        JOIN Category c ON t.Category_ID = c.Category_ID
        WHERE t.Transaction_Type = ? AND Date BETWEEN ? AND ?
        GROUP BY c.Category_ID
        ORDER BY value DESC
      `, [reportType === 'spending' ? 'expense' : 'income', formattedStartDate, formattedEndDate]);
      
      categoryData = categoryBreakdown.map(c => ({
        name: c.name,
        value: parseFloat(c.value) || 0
      }));
      
      const [currentTotal] = await connection.query(`
        SELECT SUM(Amount) as total
        FROM Transaction
        WHERE Transaction_Type = ? AND Date BETWEEN ? AND ?
      `, [reportType === 'spending' ? 'expense' : 'income', formattedStartDate, formattedEndDate]);
      
      const currentValue = parseFloat(currentTotal[0]?.total) || 0;
      const daysDiff = Math.max(1, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      summary = [
        {
          label: reportType === 'spending' ? 'Total Expenses' : 'Total Income',
          value: currentValue,
          change: 0
        },
        {
          label: 'Average Per Day',
          value: currentValue / daysDiff,
          change: 0
        }
      ];
    }
    
    await connection.end();
    res.json({
      chartData,
      series,
      categoryData,
      summary
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report data' });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Finance Tracker API is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      transactions: '/api/transactions',
      categories: '/api/categories',
      accounts: '/api/accounts',
      dashboard: '/api/dashboard',
      reports: '/api/reports'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API endpoints available at http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
  });