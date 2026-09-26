const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User, Beekeeper } = require('../models');
const { logAudit } = require('../middleware/audit');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.full_name },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
}

exports.register = async (req, res) => {
  try {
    const { email, password, full_name, role, phone, organization, state, district, experience_years } = req.body;
    
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const userRole = role === 'admin' || role === 'kvic' ? role : 'beekeeper';
    // Beekeeper accounts default to approved in demo mode, or pending if strict
    const status = userRole === 'beekeeper' ? 'approved' : 'approved';

    const user = await User.create({
      email,
      password_hash,
      role: userRole,
      status,
      full_name,
      phone,
      organization
    });

    if (userRole === 'beekeeper') {
      const regNo = 'BK-' + Math.floor(100000 + Math.random() * 900000);
      await Beekeeper.create({
        user_id: user.id,
        registration_no: regNo,
        state: state || 'Karnataka',
        district: district || 'Kodagu',
        experience_years: experience_years || 2,
        bio: 'Certified HoneyChain producer'
      });
    }

    await logAudit(user.id, 'USER_REGISTERED', 'User', user.id, { email, role: userRole });

    const token = generateToken(user);
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [{ model: Beekeeper, as: 'beekeeperProfile' }]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    await logAudit(user.id, 'USER_LOGIN', 'User', user.id, { email: user.email }, req.ip);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status,
        beekeeperProfile: user.beekeeperProfile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Beekeeper, as: 'beekeeperProfile' }]
    });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
};
