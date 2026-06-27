const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  updateMeValidation,
  listMembersValidation,
  idParamValidation,
} = require('../validators/memberValidator');
const {
  getMe,
  updateMe,
  listMembers,
  getMemberById,
  deleteMember,
} = require('../controllers/memberController');

const router = express.Router();

// Members access their own profile
router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMeValidation, validateRequest, updateMe);

// Librarian-only member management
router.get('/', authMiddleware, roleMiddleware('librarian'), listMembersValidation, validateRequest, listMembers);
router.get('/:id', authMiddleware, roleMiddleware('librarian'), idParamValidation, validateRequest, getMemberById);
router.delete('/:id', authMiddleware, roleMiddleware('librarian'), idParamValidation, validateRequest, deleteMember);

module.exports = router;
