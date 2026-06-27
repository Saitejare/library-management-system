const mongoose = require('mongoose');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/members/me
const getMe = async (req, res) => {
  try {
    const user = req.user; // already selected without password in authMiddleware

    const data = {
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || null,
      address: user.address || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return successResponse(res, data, 'Profile fetched successfully');
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, 'Failed to fetch profile', 500);
  }
};

// PUT /api/members/me
const updateMe = async (req, res) => {
  try {
    const allowed = {};
    const { name, phone, address } = req.body;
    if (typeof name !== 'undefined') allowed.name = name;
    if (typeof phone !== 'undefined') allowed.phone = phone;
    if (typeof address !== 'undefined') allowed.address = address;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: allowed },
      { new: true, runValidators: true, context: 'query' }
    ).select('-password');

    return successResponse(res, updated, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 'Failed to update profile', 500);
  }
};

// GET /api/members
const listMembers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
      search,
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const pageSize = Math.min(parseInt(limit, 10) || 10, 100);

    const filter = { isActive: true };
    if (search) {
      const s = search.trim();
      filter.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
      ];
    }

    const totalMembers = await User.countDocuments(filter);

    const totalPages = Math.ceil(totalMembers / pageSize);

    const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

    const members = await User.find(filter)
      .select('name email role phone address createdAt updatedAt')
      .sort(sort)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return successResponse(res, {
      members,
      pagination: {
        totalMembers,
        totalPages,
        currentPage: pageNum,
        pageSize,
      },
    }, 'Members fetched successfully');
  } catch (error) {
    console.error('List members error:', error);
    return errorResponse(res, 'Failed to fetch members', 500);
  }
};

// GET /api/members/:id
const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid member id', 400);
    }

    const member = await User.findOne({ _id: id, isActive: true }).select('name email role phone address createdAt updatedAt').lean();
    if (!member) {
      return errorResponse(res, 'Member not found', 404);
    }

    return successResponse(res, member, 'Member fetched successfully');
  } catch (error) {
    console.error('Get member error:', error);
    return errorResponse(res, 'Failed to fetch member', 500);
  }
};

// DELETE /api/members/:id (soft delete)
const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid member id', 400);
    }

    // Cannot delete yourself
    if (req.user._id.toString() === id) {
      return errorResponse(res, 'You cannot delete your own account', 403);
    }

    const member = await User.findById(id).select('+password role isActive');
    if (!member || !member.isActive) {
      return errorResponse(res, 'Member not found', 404);
    }

    // Cannot delete another librarian
    if (member.role === 'librarian') {
      return errorResponse(res, 'Cannot delete a librarian', 403);
    }

    // Soft delete: set isActive = false
    member.isActive = false;
    await member.save();

    return successResponse(res, null, 'Member deleted successfully');
  } catch (error) {
    console.error('Delete member error:', error);
    return errorResponse(res, 'Failed to delete member', 500);
  }
};

module.exports = {
  getMe,
  updateMe,
  listMembers,
  getMemberById,
  deleteMember,
};