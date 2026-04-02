
// routes/bookings.js
import { Router } from 'express';
import { bookCourse, bookSession, cancelBooking } from '../controllers/bookingController.js';
import { verify } from '../middlewares/auth.js';

const router = Router();

// All booking routes require authentication
router.use(verify);

router.post('/course', bookCourse);
router.post('/session', bookSession);
router.delete('/:bookingId', cancelBooking);

export default router;
