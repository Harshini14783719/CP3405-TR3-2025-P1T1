const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 注册
router.post('/register', authController.register);

// 登录
router.post('/login', authController.login);

module.exports = router;
