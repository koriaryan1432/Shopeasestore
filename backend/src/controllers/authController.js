const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const notificationService = require('../services/notificationService');

// Helper to generate and send OTP
const generateAndSendOTP = async (identifier, type) => {
  // Generate 6 digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  // Set expiry to 10 minutes from now
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Clear any existing OTP for this identifier and type
  await pool.query('DELETE FROM otps WHERE identifier = ? AND type = ?', [identifier, type]);

  // Insert new OTP
  await pool.query(
    'INSERT INTO otps (identifier, code, type, expires_at) VALUES (?, ?, ?, ?)',
    [identifier, code, type, expiresAt]
  );

  // Trigger send asynchronously
  if (type === 'email') {
    await notificationService.sendEmailOTP(identifier, code);
  } else {
    await notificationService.sendSMSOTP(identifier, code);
  }
};

// GET /api/auth/config
const getAuthConfig = async (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone_number } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, phone_number, is_email_verified, is_phone_verified) VALUES (?, ?, ?, ?, 0, 0)',
      [name, email, hashedPassword, phone_number || null]
    );

    const userId = result.insertId;

    // Send OTPs
    try {
      await generateAndSendOTP(email, 'email');
      if (phone_number) {
        await generateAndSendOTP(phone_number, 'phone');
      }
    } catch (otpErr) {
      console.error('OTP sending error during registration:', otpErr.message);
    }

    const user = { 
      id: userId, 
      name, 
      email, 
      phone_number: phone_number || null,
      is_email_verified: 0,
      is_phone_verified: 0,
      role: 'customer' 
    };

    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const userRow = rows[0];
    const match = await bcrypt.compare(password, userRow.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Trigger welcome email if first login
    if (userRow.welcome_sent === 0) {
      notificationService.sendWelcomeEmail(userRow.email, userRow.name)
        .then(async () => {
          await pool.query('UPDATE users SET welcome_sent = 1 WHERE id = ?', [userRow.id]);
          console.log(`Updated welcome_sent status for user ${userRow.email}`);
        })
        .catch(err => console.error('Welcome email error:', err.message));
    }

    const user = { 
      id: userRow.id, 
      name: userRow.name, 
      email: userRow.email, 
      phone_number: userRow.phone_number,
      is_email_verified: userRow.is_email_verified,
      is_phone_verified: userRow.is_phone_verified,
      role: userRow.role 
    };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/google
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    let email, name, googleId;

    // Check if Google Client ID is configured. If not, use sandbox mode.
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID.includes('placeholder')) {
      // Decode credential locally if it's a JSON string or fallback to test user
      try {
        const decoded = JSON.parse(credential);
        email = decoded.email || 'sandbox.oauth@example.com';
        name = decoded.name || 'Sandbox OAuth User';
        googleId = decoded.googleId || 'sandbox-google-id-12345';
      } catch {
        email = 'sandbox.oauth@example.com';
        name = 'Sandbox OAuth User';
        googleId = 'sandbox-google-id-12345';
      }
      console.log('ℹ️ Google OAuth sandbox active (mocked payload processed):', { email, name });
    } else {
      // Real Google Client verification
      const { OAuth2Client } = require('google-auth-library');
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      googleId = payload.sub;
    }

    // Check if user exists
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    let userRow;

    if (rows.length === 0) {
      // Register new user via Google
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
      const [insertResult] = await pool.query(
        'INSERT INTO users (name, email, password, google_id, is_email_verified) VALUES (?, ?, ?, ?, 1)',
        [name, email, randomPassword, googleId]
      );
      
      const [newRows] = await pool.query('SELECT * FROM users WHERE id = ?', [insertResult.insertId]);
      userRow = newRows[0];
    } else {
      userRow = rows[0];
      // Update Google ID if not set, and mark email verified since Google verified it
      if (!userRow.google_id || userRow.is_email_verified === 0) {
        await pool.query(
          'UPDATE users SET google_id = ?, is_email_verified = 1 WHERE id = ?',
          [googleId, userRow.id]
        );
        userRow.google_id = googleId;
        userRow.is_email_verified = 1;
      }
    }

    // Trigger welcome email if first login
    if (userRow.welcome_sent === 0) {
      notificationService.sendWelcomeEmail(userRow.email, userRow.name)
        .then(async () => {
          await pool.query('UPDATE users SET welcome_sent = 1 WHERE id = ?', [userRow.id]);
          console.log(`Updated welcome_sent status for OAuth user ${userRow.email}`);
        })
        .catch(err => console.error('Welcome email error (OAuth):', err.message));
    }

    const user = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      phone_number: userRow.phone_number,
      is_email_verified: userRow.is_email_verified,
      is_phone_verified: userRow.is_phone_verified,
      role: userRow.role,
    };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user });
  } catch (err) {
    console.error('Google Auth error:', err);
    res.status(500).json({ message: 'Google Authentication failed' });
  }
};

// POST /api/auth/otp/send
const sendOTP = async (req, res) => {
  try {
    const { identifier, type } = req.body;
    if (!identifier || !type || !['email', 'phone'].includes(type)) {
      return res.status(400).json({ message: 'Identifier and valid type (email/phone) are required' });
    }

    await generateAndSendOTP(identifier, type);
    res.json({ message: `OTP code sent successfully to your ${type}` });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP code' });
  }
};

// POST /api/auth/otp/verify
const verifyOTP = async (req, res) => {
  try {
    const { identifier, code, type } = req.body;
    if (!identifier || !code || !type || !['email', 'phone'].includes(type)) {
      return res.status(400).json({ message: 'Identifier, code, and valid type are required' });
    }

    // Validate the OTP code from DB (must not be expired)
    const [rows] = await pool.query(
      'SELECT * FROM otps WHERE identifier = ? AND code = ? AND type = ? AND expires_at > NOW()',
      [identifier, code, type]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    // Delete used OTP
    await pool.query('DELETE FROM otps WHERE id = ?', [rows[0].id]);

    // Update user verification status
    if (type === 'email') {
      await pool.query('UPDATE users SET is_email_verified = 1 WHERE email = ?', [identifier]);
    } else {
      await pool.query('UPDATE users SET is_phone_verified = 1 WHERE phone_number = ?', [identifier]);
    }

    res.json({ message: `${type === 'email' ? 'Email' : 'Phone number'} verified successfully` });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Verification failed' });
  }
};

// GET /api/auth/admin/users (admin only)
const getAdminUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, phone_number, is_email_verified, is_phone_verified, google_id, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (err) {
    console.error('Get admin users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/auth/admin/users/:id/role (admin only)
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['customer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Valid role is required (customer or admin)' });
    }

    const [result] = await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated successfully', id, role });
  } catch (err) {
    console.error('Update user role error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getAuthConfig,
  googleLogin,
  sendOTP,
  verifyOTP,
  getAdminUsers,
  updateUserRole,
};
