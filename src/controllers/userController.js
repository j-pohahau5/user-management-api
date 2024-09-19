const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const newUser = await User.create({ username, email, password: hashedPassword });
    res.status(201).json({ message: 'User created', user: newUser });
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  
  res.json({ username: user.username, email: user.email });
};

exports.updateProfile = async (req, res) => {
  const { username, email } = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, { username, email }, { new: true });
  
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'Profile updated', user });
};

exports.deleteProfile = async (req, res) => {
  const user = await User.findByIdAndDelete(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  
  res.json({ message: 'Profile deleted' });
};