import User from '../models/User.js';
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, studentId, department } = req.body;
    const user = await User.findById(req.user._id);

    if (fullName) user.fullName = fullName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (studentId !== undefined) user.studentId = studentId.trim();
    if (department !== undefined) user.department = department.trim();

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        department: user.department,
        studentId: user.studentId,
        phone: user.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users/admin/all
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const query = {};

    if (role && role !== 'All') {
      query.role = role;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { fullName: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { studentId: { $regex: term, $options: 'i' } },
        { department: { $regex: term, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort('-createdAt');

    return res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};

// @desc    Create new user (Admin only)
// @route   POST /api/users/admin
// @access  Private (Admin)
export const createUser = async (req, res) => {
  try {
    const { fullName, email, password, role, status, phone, studentId, department } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'User with this email already exists.' });
    }
    const newUser = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role === 'admin' ? 'admin' : 'user',
      status: status === 'inactive' ? 'inactive' : 'active',
      phone: phone ? phone.trim() : '',
      studentId: studentId ? studentId.trim() : '',
      department: department ? department.trim() : '',
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: newUser,
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
};

// @desc    Update user details & role (Admin only)
// @route   PUT /api/users/admin/:id
// @access  Private (Admin)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, role, status, phone, studentId, department, newPassword } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin' && (role === 'user' || status === 'inactive')) {
      const activeAdminCount = await User.countDocuments({
        role: 'admin',
        status: 'active',
      });

      if (activeAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Action blocked: Cannot demote or deactivate the last remaining active administrator.',
        });
      }
    }

    if (fullName) user.fullName = fullName.trim();
    if (role && ['user', 'admin'].includes(role)) user.role = role;
    if (status && ['active', 'inactive'].includes(status)) user.status = status;
    if (phone !== undefined) user.phone = phone.trim();
    if (studentId !== undefined) user.studentId = studentId.trim();
    if (department !== undefined) user.department = department.trim();

    if (newPassword && newPassword.length >= 6) {
      user.password = newPassword;
    }

    await user.save();

    return res.json({
      success: true,
      message: 'User account updated successfully.',
      user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
};

// @desc    Delete user account (Admin only)
// @route   DELETE /api/users/admin/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      const activeAdminCount = await User.countDocuments({
        role: 'admin',
        status: 'active',
      });

      if (activeAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Action blocked: Cannot delete the last remaining active administrator account.',
        });
      }
    }

    await Claim.deleteMany({ claimant: id });
    await User.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'User account deleted successfully.',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};