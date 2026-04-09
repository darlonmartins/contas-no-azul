const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const { getUserProfile, updateProfile, updatePassword } = require('../controllers/userController');

router.get('/me',       authenticate, getUserProfile);
router.put('/me',       authenticate, updateProfile);
router.put('/password', authenticate, updatePassword);

module.exports = router;
