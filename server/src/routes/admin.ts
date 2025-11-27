import express from 'express';
import {
    getDashboardStats,
    getRecentActivity,
    getReports,

    // Faculties
    getFaculties, createFaculty, updateFaculty, deleteFaculty,

    // Users
    getUsers, updateUser,

    // Zones
    getParkingZones, createZone, updateZone, deleteZone,

    // Lots
    getLots, createLot, updateLot, deleteLot,

    // Vehicles
    getVehicles, createVehicle, updateVehicle, deleteVehicle,

    // Permits
    getPermits, createPermit, updatePermit, deletePermit,

    // Reservations
    getReservations, updateReservationStatus, cancelReservation,

    // Sessions
    getSessions, checkIn, checkOut,

    // Fines
    getFines, issueFine,

    // Payments
    getPayments, recordPayment
} from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all admin routes
router.use(authenticateToken);

// Dashboard & Reports
router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);
router.get('/reports', getReports);

// Faculties
router.get('/faculties', getFaculties);
router.post('/faculties', createFaculty);
router.put('/faculties/:id', updateFaculty);
router.delete('/faculties/:id', deleteFaculty);

// Users
router.get('/users', getUsers); // Renamed from campus-users for consistency if preferred, but user asked for campus-users. I'll stick to /users as per previous code or change to /campus-users. Let's use /campus-users to match request.
// Wait, previous code used /users. I'll alias it.
router.get('/campus-users', getUsers);
router.put('/campus-users/:id', updateUser);

// Zones
router.get('/zones', getParkingZones);
router.post('/zones', createZone);
router.put('/zones/:id', updateZone);
router.delete('/zones/:id', deleteZone);

// Lots
router.get('/lots', getLots);
router.post('/lots', createLot);
router.put('/lots/:id', updateLot);
router.delete('/lots/:id', deleteLot);

// Vehicles
router.get('/vehicles', getVehicles);
router.post('/vehicles', createVehicle);
router.put('/vehicles/:id', updateVehicle);
router.delete('/vehicles/:id', deleteVehicle);

// Permits
router.get('/permits', getPermits);
router.post('/permits', createPermit);
router.put('/permits/:id', updatePermit);
router.delete('/permits/:id', deletePermit);

// Reservations
router.get('/reservations', getReservations);
router.patch('/reservations/:id/status', updateReservationStatus);
router.patch('/reservations/:id/cancel', cancelReservation);

// Sessions
router.get('/sessions', getSessions);
router.post('/sessions/check-in', checkIn);
router.post('/sessions/:sessionID/check-out', checkOut);

// Fines
router.get('/fines', getFines);
router.post('/fines', issueFine);

// Payments
router.get('/payments', getPayments);
router.post('/payments', recordPayment);

export default router;
