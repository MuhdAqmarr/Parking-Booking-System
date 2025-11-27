import { Request, Response } from 'express';
import prisma from '../prisma.js';

// --- Helper for Pagination/Filtering ---
const getPaginationParams = (req: Request) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    return { page, limit, skip, search };
};

// --- Dashboard Stats & Reports ---
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalSpaces = await prisma.parkingLot.count();
        const occupiedSpaces = await prisma.parkingLot.count({ where: { status: 'Occupied' } });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const revenueResult = await prisma.payment.aggregate({
            _sum: { amountPaid: true },
            where: { paymentDate: { gte: today } }
        });

        const activeFines = await prisma.fine.count({ where: { status: 'Unpaid' } });

        res.json({
            totalSpaces,
            occupiedSpaces,
            revenue: revenueResult._sum.amountPaid || 0,
            activeFines
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

export const getReports = async (req: Request, res: Response) => {
    try {
        // Occupancy Report (Simple count for now)
        const totalLots = await prisma.parkingLot.count();
        const occupiedLots = await prisma.parkingLot.count({ where: { status: 'Occupied' } });

        // Fines Report
        const totalFines = await prisma.fine.count();
        const paidFines = await prisma.fine.count({ where: { status: 'Paid' } });

        // Revenue
        const totalRevenue = await prisma.payment.aggregate({ _sum: { amountPaid: true } });

        // Reservations by Date (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const reservationsLast7Days = await prisma.reservation.groupBy({
            by: ['reservationDate'],
            where: { reservationDate: { gte: sevenDaysAgo } },
            _count: { reservationID: true }
        });

        res.json({
            occupancy: { total: totalLots, occupied: occupiedLots },
            fines: { total: totalFines, paid: paidFines },
            revenue: totalRevenue._sum.amountPaid || 0,
            reservationsTrend: reservationsLast7Days
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
};

// --- Faculties ---
export const getFaculties = async (req: Request, res: Response) => {
    try {
        const faculties = await prisma.faculty.findMany();
        res.json(faculties);
    } catch (error) { res.status(500).json({ error: 'Error fetching faculties' }); }
};

export const createFaculty = async (req: Request, res: Response) => {
    try {
        const faculty = await prisma.faculty.create({ data: req.body });
        res.json(faculty);
    } catch (error) { res.status(500).json({ error: 'Error creating faculty' }); }
};

export const updateFaculty = async (req: Request, res: Response) => {
    try {
        const faculty = await prisma.faculty.update({
            where: { facultyID: parseInt(req.params.id) },
            data: req.body
        });
        res.json(faculty);
    } catch (error) { res.status(500).json({ error: 'Error updating faculty' }); }
};

export const deleteFaculty = async (req: Request, res: Response) => {
    try {
        await prisma.faculty.delete({ where: { facultyID: parseInt(req.params.id) } });
        res.json({ message: 'Faculty deleted' });
    } catch (error) { res.status(500).json({ error: 'Error deleting faculty' }); }
};

// --- Campus Users ---
export const getUsers = async (req: Request, res: Response) => {
    const { search } = getPaginationParams(req);
    try {
        const where = search ? {
            OR: [
                { fullName: { contains: search } },
                { email: { contains: search } },
                { studentNo: { contains: search } },
                { staffNo: { contains: search } }
            ]
        } : {};

        const users = await prisma.campusUser.findMany({
            where,
            include: { vehicles: true, faculty: true },
            take: 100 // Limit for performance
        });
        res.json(users);
    } catch (error) { res.status(500).json({ error: 'Error fetching users' }); }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const user = await prisma.campusUser.update({
            where: { campusUserID: parseInt(req.params.id) },
            data: req.body
        });
        res.json(user);
    } catch (error) { res.status(500).json({ error: 'Error updating user' }); }
};

// --- Parking Zones ---
export const getParkingZones = async (req: Request, res: Response) => {
    try {
        const zones = await prisma.parkingZone.findMany({ include: { parkingLots: true } });
        const zonesWithStats = zones.map(zone => ({
            ...zone,
            totalSpots: zone.parkingLots.length,
            occupiedSpots: zone.parkingLots.filter(l => l.status === 'Occupied').length,
            occupancyRate: zone.parkingLots.length > 0 ? (zone.parkingLots.filter(l => l.status === 'Occupied').length / zone.parkingLots.length) * 100 : 0
        }));
        res.json(zonesWithStats);
    } catch (error) { res.status(500).json({ error: 'Error fetching zones' }); }
};

export const createZone = async (req: Request, res: Response) => {
    try {
        const zone = await prisma.parkingZone.create({ data: req.body });
        res.json(zone);
    } catch (error) { res.status(500).json({ error: 'Error creating zone' }); }
};

export const updateZone = async (req: Request, res: Response) => {
    try {
        const zone = await prisma.parkingZone.update({
            where: { zoneID: parseInt(req.params.id) },
            data: req.body
        });
        res.json(zone);
    } catch (error) { res.status(500).json({ error: 'Error updating zone' }); }
};

export const deleteZone = async (req: Request, res: Response) => {
    try {
        await prisma.parkingZone.delete({ where: { zoneID: parseInt(req.params.id) } });
        res.json({ message: 'Zone deleted' });
    } catch (error) { res.status(500).json({ error: 'Error deleting zone' }); }
};

// --- Parking Lots ---
export const getLots = async (req: Request, res: Response) => {
    try {
        const lots = await prisma.parkingLot.findMany({ include: { zone: true } });
        res.json(lots);
    } catch (error) { res.status(500).json({ error: 'Error fetching lots' }); }
};

export const createLot = async (req: Request, res: Response) => {
    try {
        const lot = await prisma.parkingLot.create({ data: req.body });
        res.json(lot);
    } catch (error) { res.status(500).json({ error: 'Error creating lot' }); }
};

export const updateLot = async (req: Request, res: Response) => {
    try {
        const lot = await prisma.parkingLot.update({
            where: { lotID: parseInt(req.params.id) },
            data: req.body
        });
        res.json(lot);
    } catch (error) { res.status(500).json({ error: 'Error updating lot' }); }
};

export const deleteLot = async (req: Request, res: Response) => {
    try {
        await prisma.parkingLot.delete({ where: { lotID: parseInt(req.params.id) } });
        res.json({ message: 'Lot deleted' });
    } catch (error) { res.status(500).json({ error: 'Error deleting lot' }); }
};

// --- Vehicles ---
export const getVehicles = async (req: Request, res: Response) => {
    try {
        const vehicles = await prisma.vehicle.findMany({ include: { campusUser: true } });
        res.json(vehicles);
    } catch (error) { res.status(500).json({ error: 'Error fetching vehicles' }); }
};

export const createVehicle = async (req: Request, res: Response) => {
    try {
        const vehicle = await prisma.vehicle.create({ data: req.body });
        res.json(vehicle);
    } catch (error) { res.status(500).json({ error: 'Error creating vehicle' }); }
};

export const updateVehicle = async (req: Request, res: Response) => {
    try {
        const vehicle = await prisma.vehicle.update({
            where: { vehicleID: parseInt(req.params.id) },
            data: req.body
        });
        res.json(vehicle);
    } catch (error) { res.status(500).json({ error: 'Error updating vehicle' }); }
};

export const deleteVehicle = async (req: Request, res: Response) => {
    try {
        await prisma.vehicle.delete({ where: { vehicleID: parseInt(req.params.id) } });
        res.json({ message: 'Vehicle deleted' });
    } catch (error) { res.status(500).json({ error: 'Error deleting vehicle' }); }
};

// --- Permits ---
export const getPermits = async (req: Request, res: Response) => {
    try {
        const permits = await prisma.permit.findMany({ include: { vehicle: true, zone: true } });
        res.json(permits);
    } catch (error) { res.status(500).json({ error: 'Error fetching permits' }); }
};

export const createPermit = async (req: Request, res: Response) => {
    try {
        const permit = await prisma.permit.create({ data: req.body });
        res.json(permit);
    } catch (error) { res.status(500).json({ error: 'Error creating permit' }); }
};

export const updatePermit = async (req: Request, res: Response) => {
    try {
        const permit = await prisma.permit.update({
            where: { permitID: parseInt(req.params.id) },
            data: req.body
        });
        res.json(permit);
    } catch (error) { res.status(500).json({ error: 'Error updating permit' }); }
};

export const deletePermit = async (req: Request, res: Response) => {
    try {
        await prisma.permit.delete({ where: { permitID: parseInt(req.params.id) } });
        res.json({ message: 'Permit deleted' });
    } catch (error) { res.status(500).json({ error: 'Error deleting permit' }); }
};

// --- Reservations ---
export const getReservations = async (req: Request, res: Response) => {
    const { search } = getPaginationParams(req);
    try {
        const where: any = {};
        if (search) {
            where.OR = [
                { proofCode: { contains: search } },
                { vehicle: { plateNum: { contains: search } } },
                { vehicle: { campusUser: { fullName: { contains: search } } } }
            ];
        }

        const reservations = await prisma.reservation.findMany({
            where,
            include: {
                vehicle: { include: { campusUser: true } },
                lot: true,
                zone: true
            },
            orderBy: { createdDateTime: 'desc' },
            take: 100
        });
        res.json(reservations);
    } catch (error) { res.status(500).json({ error: 'Error fetching reservations' }); }
};

export const updateReservationStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const reservation = await prisma.reservation.update({
            where: { reservationID: parseInt(id) },
            data: { status },
            include: { lot: true }
        });

        // If cancelled or completed, free the lot
        if (status === 'Cancelled' || status === 'Completed') {
            await prisma.parkingLot.update({
                where: { lotID: reservation.lotID },
                data: { status: 'Available' }
            });
        }

        res.json(reservation);
    } catch (error) { res.status(500).json({ error: 'Error updating reservation' }); }
};

export const cancelReservation = async (req: Request, res: Response) => {
    // Re-using update logic for specific cancel endpoint if needed, or just use updateReservationStatus
    req.body.status = 'Cancelled';
    return updateReservationStatus(req, res);
};

// --- Sessions (Check-in / Check-out) ---
export const getSessions = async (req: Request, res: Response) => {
    try {
        const sessions = await prisma.parkingSession.findMany({
            include: {
                vehicle: { include: { campusUser: true } },
                lot: true,
                reservation: true
            },
            orderBy: { entryTime: 'desc' },
            take: 100
        });
        res.json(sessions);
    } catch (error) { res.status(500).json({ error: 'Error fetching sessions' }); }
};

export const checkIn = async (req: Request, res: Response) => {
    const { plateNum, lotID, proofCode } = req.body;
    try {
        let reservationID = null;
        let vehicleID = null;

        // Find vehicle
        const vehicle = await prisma.vehicle.findUnique({ where: { plateNum } });
        if (!vehicle) {
            // Optionally create vehicle if not exists or return error. 
            // For now, assume vehicle must exist or be created via vehicle reg.
            // But requirement says "Check-in by plateNum -> create session". 
            // If vehicle doesn't exist, we might need to create a "Guest" vehicle or error.
            // Let's error for now to keep it safe.
            return res.status(404).json({ error: 'Vehicle not found. Please register vehicle first.' });
        }
        vehicleID = vehicle.vehicleID;

        // If proofCode provided, link reservation
        if (proofCode) {
            const reservation = await prisma.reservation.findUnique({ where: { proofCode } });
            if (reservation) {
                if (reservation.vehicleID !== vehicleID) {
                    return res.status(400).json({ error: 'Reservation does not match vehicle' });
                }
                reservationID = reservation.reservationID;

                // Update reservation status
                await prisma.reservation.update({
                    where: { reservationID },
                    data: { status: 'CheckedIn' }
                });
            }
        }

        // Create Session
        const session = await prisma.parkingSession.create({
            data: {
                vehicleID,
                lotID,
                reservationID,
                entryTime: new Date(),
                sessionType: reservationID ? 'Reservation' : 'WalkIn'
            }
        });

        // Mark lot occupied
        await prisma.parkingLot.update({
            where: { lotID },
            data: { status: 'Occupied' }
        });

        res.json(session);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Check-in failed' });
    }
};

export const checkOut = async (req: Request, res: Response) => {
    const { sessionID } = req.params;
    try {
        const session = await prisma.parkingSession.update({
            where: { sessionID: parseInt(sessionID) },
            data: {
                exitTime: new Date()
            },
            include: { lot: true }
        });

        // Free lot
        await prisma.parkingLot.update({
            where: { lotID: session.lotID },
            data: { status: 'Available' }
        });

        // If linked reservation, complete it
        if (session.reservationID) {
            await prisma.reservation.update({
                where: { reservationID: session.reservationID },
                data: { status: 'Completed' }
            });
        }

        res.json(session);
    } catch (error) { res.status(500).json({ error: 'Check-out failed' }); }
};

// --- Fines ---
export const getFines = async (req: Request, res: Response) => {
    try {
        const fines = await prisma.fine.findMany({
            include: {
                session: { include: { vehicle: { include: { campusUser: true } } } },
                admin: true
            },
            orderBy: { issuedDate: 'desc' }
        });
        res.json(fines);
    } catch (error) { res.status(500).json({ error: 'Error fetching fines' }); }
};

export const issueFine = async (req: Request, res: Response) => {
    const { sessionID, fineType, amount, remarks } = req.body;
    // @ts-ignore
    const adminID = req.user?.adminID || 1; // Fallback if auth fails for some reason

    try {
        const fine = await prisma.fine.create({
            data: {
                sessionID,
                adminID,
                fineType,
                amount: parseFloat(amount),
                status: 'Unpaid',
                remarks
            }
        });

        await prisma.parkingSession.update({
            where: { sessionID },
            data: { isViolation: true }
        });

        res.json(fine);
    } catch (error) { res.status(500).json({ error: 'Error issuing fine' }); }
};

// --- Payments ---
export const getPayments = async (req: Request, res: Response) => {
    try {
        const payments = await prisma.payment.findMany({
            include: { fine: true, admin: true },
            orderBy: { paymentDate: 'desc' }
        });
        res.json(payments);
    } catch (error) { res.status(500).json({ error: 'Error fetching payments' }); }
};

export const recordPayment = async (req: Request, res: Response) => {
    const { fineID, amountPaid, receiptNum } = req.body;
    // @ts-ignore
    const adminID = req.user?.adminID || 1;

    try {
        const payment = await prisma.payment.create({
            data: {
                fineID,
                adminID,
                amountPaid: parseFloat(amountPaid),
                paymentMethod: 'Cash',
                receiptNum,
                paymentDate: new Date()
            }
        });

        // Check if fully paid
        const fine = await prisma.fine.findUnique({
            where: { fineID },
            include: { payments: true }
        });

        if (fine) {
            const totalPaid = fine.payments.reduce((sum, p) => sum + p.amountPaid, 0);
            if (totalPaid >= fine.amount) {
                await prisma.fine.update({
                    where: { fineID },
                    data: { status: 'Paid' }
                });
            }
        }

        res.json(payment);
    } catch (error) { res.status(500).json({ error: 'Error recording payment' }); }
};

export const getRecentActivity = async (req: Request, res: Response) => {
    try {
        const recentReservations = await prisma.reservation.findMany({
            take: 5,
            orderBy: { createdDateTime: 'desc' },
            include: { vehicle: { include: { campusUser: true } }, zone: true, lot: true }
        });

        const activities = recentReservations.map(res => ({
            id: res.reservationID,
            type: 'Reservation',
            description: `Reservation confirmed for ${res.vehicle.campusUser?.fullName || 'User'}`,
            detail: `${res.zone.zoneName} • ${res.lot.lotNumber}`,
            time: res.createdDateTime
        }));

        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
};
