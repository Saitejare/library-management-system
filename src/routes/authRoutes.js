const express = require('express');
const { registerValidation, loginValidation } = require('../validators/authValidator');
const validateRequest = require('../middleware/validateRequest');
const { register, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);

module.exports = router;
