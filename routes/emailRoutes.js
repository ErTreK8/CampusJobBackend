const express = require('express');
const router = express.Router();
const { sendEmailController } = require('../controllers/emailController');

router.post('/send-email', sendEmailController);

module.exports = router;