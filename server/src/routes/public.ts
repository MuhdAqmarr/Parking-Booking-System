import { Router } from 'express';
import {
    verifyCampusUser,
    getFaculties,
    getZones,
    getAvailableLots,
    createReservation,
    getReservation,
    getFines,
    payFine,
    getAnnouncements,
    getOverview,
    findReservation,
    confirmFinePayment
} from '../controllers/publicController.js';

const router = Router();

router.post('/verify-campus-user', verifyCampusUser);
router.get('/faculties', getFaculties);
router.get('/zones', getZones);
router.get('/available-lots', getAvailableLots);
router.post('/reservations', createReservation);
router.get('/reservations/:proofCode', getReservation);
router.get('/fines', getFines);
router.post('/fines/:fineID/pay', payFine);
router.post('/fines/confirm', confirmFinePayment);
router.get('/announcements', getAnnouncements);
router.get('/overview', getOverview);
router.post('/find-reservation', findReservation);

export default router;
