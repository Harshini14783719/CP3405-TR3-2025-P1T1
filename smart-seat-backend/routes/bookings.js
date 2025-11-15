const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/', bookingController.getAllBookings);
router.get('/getBookedSeats', bookingController.getBookedSeats);
router.post('/update-expired', bookingController.updateExpiredBookings);

router.post('/generate-qrcode', bookingController.generateQrCode);
router.get('/verify-booking/:bookingId', bookingController.verifyBooking);

router.post('/update-by-detection', bookingController.updateSeatStatusByDetection);

router.get('/:id', bookingController.getBookingById);
router.post('/', bookingController.createbooking);
router.put('/:id', bookingController.updatebooking);
router.patch('/:id', bookingController.updatebooking);
router.put('/:id/cancel', bookingController.cancelBooking);
router.delete('/:id', bookingController.deletebooking);

module.exports = router;
