const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// --- 您已有的路由 (保持不变) ---
router.get('/', bookingController.getAllBookings);
router.get('/getBookedSeats', bookingController.getBookedSeats);
router.post('/update-expired', bookingController.updateExpiredBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', bookingController.createbooking);
router.put('/:id', bookingController.updatebooking);
router.patch('/:id', bookingController.updatebooking);
router.delete('/:id', bookingController.deletebooking);
router.put('/:id/cancel', bookingController.cancelBooking);


// --- 在这里添加新的路由 ---

// 1. 生成并存储二维码的路由
// 访问方式: POST http://your-domain.com/api/bookings/generate-qrcode
router.post('/generate-qrcode', bookingController.generateQrCode);

// 2. 验证二维码并办理入住的路由
// 访问方式: GET http://your-domain.com/api/bookings/verify-booking/:bookingId
// 注意：这个路由通常不是给前端直接调用的，而是通过扫描二维码访问
router.get('/verify-booking/:bookingId', bookingController.verifyBooking);


// --- 文件末尾 (保持不变) ---
module.exports = router;