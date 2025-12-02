import { Request, Response } from 'express';
import { AppDataSource } from '../data-source.js';
import { ParkingLot } from '../entity/ParkingLot.js';
import { Payment } from '../entity/Payment.js';
import { Fine } from '../entity/Fine.js';
import { Reservation } from '../entity/Reservation.js';
import { Faculty } from '../entity/Faculty.js';
import { CampusUser } from '../entity/CampusUser.js';
import { ParkingZone } from '../entity/ParkingZone.js';
import { Vehicle } from '../entity/Vehicle.js';
import { Permit } from '../entity/Permit.js';
import { ParkingSession } from '../entity/ParkingSession.js';
import { Like, MoreThanOrEqual } from 'typeorm';

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
        const lotRepo = AppDataSource.getRepository(ParkingLot);
        const totalSpaces = await lotRepo.count();
        const occupiedSpaces = await lotRepo.count({ where: { status: 'Occupied' } });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const paymentRepo = AppDataSource.getRepository(Payment);
        const revenueResult = await paymentRepo
            .createQueryBuilder("payment")
            .select("SUM(payment.amountPaid)", "sum")
            .where("payment.paymentDate >= :today", { today })
            .getRawOne();

        const fineRepo = AppDataSource.getRepository(Fine);
        const activeFines = await fineRepo.count({ where: { status: 'Unpaid' } });

        res.json({
            totalSpaces,
            occupiedSpaces,
            revenue: revenueResult?.sum || 0,
            activeFines
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

export const getReports = async (req: Request, res: Response) => {
    try {
        const lotRepo = AppDataSource.getRepository(ParkingLot);
        const totalLots = await lotRepo.count();
        const occupiedLots = await lotRepo.count({ where: { status: 'Occupied' } });

        const fineRepo = AppDataSource.getRepository(Fine);
        const totalFines = await fineRepo.count();
        const paidFines = await fineRepo.count({ where: { status: 'Paid' } });

        const paymentRepo = AppDataSource.getRepository(Payment);
        const totalRevenue = await paymentRepo
            .createQueryBuilder("payment")
            .select("SUM(payment.amountPaid)", "sum")
            .getRawOne();

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const resRepo = AppDataSource.getRepository(Reservation);
        const reservationsLast7Days = await resRepo
            .createQueryBuilder("reservation")
            .select("reservation.reservationDate", "date")
            .addSelect("COUNT(reservation.reservationID)", "count")
            .where("reservation.reservationDate >= :sevenDaysAgo", { sevenDaysAgo })
            .groupBy("reservation.reservationDate")
            .getRawMany();

        res.json({
            occupancy: { total: totalLots, occupied: occupiedLots },
            fines: { total: totalFines, paid: paidFines },
            revenue: totalRevenue?.sum || 0,
            reservationsTrend: reservationsLast7Days
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
};

// --- Faculties ---
export const getFaculties = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(Faculty);
        const faculties = await repo.find();
        res.json(faculties);
    } catch (error) { res.status(500).json({ error: 'Error fetching faculties' }); }
};

export const createFaculty = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(Faculty);
        const faculty = repo.create(req.body);
        await repo.save(faculty);
        res.json(faculty);
    } catch (error) { res.status(500).json({ error: 'Error creating faculty' }); }
};

export const updateFaculty = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(Faculty);
        await repo.update(req.params.id, req.body);
        const faculty = await repo.findOneBy({ facultyID: parseInt(req.params.id) });
        res.json(faculty);
    } catch (error) { res.status(500).json({ error: 'Error updating faculty' }); }
};

export const deleteFaculty = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(Faculty);
        await repo.delete(req.params.id);
        res.json({ message: 'Faculty deleted' });
    } catch (error) { res.status(500).json({ error: 'Error deleting faculty' }); }
};

// --- Campus Users ---
export const getUsers = async (req: Request, res: Response) => {
    const { search } = getPaginationParams(req);
    try {
        const repo = AppDataSource.getRepository(CampusUser);
        const where: any = [];
        if (search) {
            where.push({ fullName: Like(`%${search}%`) });
            where.push({ email: Like(`%${search}%`) });
            where.push({ studentNo: Like(`%${search}%`) });
            where.push({ staffNo: Like(`%${search}%`) });
        }

        const users = await repo.find({
            where: where.length > 0 ? where : undefined,
            relations: ["vehicles", "faculty"],
            take: 100
        });
        res.json(users);
    } catch (error) { res.status(500).json({ error: 'Error fetching users' }); }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(CampusUser);
        await repo.update(req.params.id, req.body);
        const user = await repo.findOneBy({ campusUserID: parseInt(req.params.id) });
        res.json(user);
    } catch (error) { res.status(500).json({ error: 'Error updating user' }); }
};

// --- Parking Zones ---
export const getParkingZones = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(ParkingZone);
        const zones = await repo.find({ relations: ["parkingLots"] });
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
        const repo = AppDataSource.getRepository(ParkingZone);
        const zone = repo.create(req.body);
        await repo.save(zone);
        res.json(zone);
    } catch (error) { res.status(500).json({ error: 'Error creating zone' }); }
};

export const updateZone = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(ParkingZone);
        await repo.update(req.params.id, req.body);
        const zone = await repo.findOneBy({ zoneID: parseInt(req.params.id) });
        res.json(zone);
    } catch (error) { res.status(500).json({ error: 'Error updating zone' }); }
};

export const deleteZone = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(ParkingZone);
        await repo.delete(req.params.id);
        res.json({ message: 'Zone deleted' });
    } catch (error) { res.status(500).json({ error: 'Error deleting zone' }); }
};

// --- Parking Lots ---
export const getLots = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(ParkingLot);
        const lots = await repo.find({ relations: ["zone"] });
        res.json(lots);
    } catch (error) { res.status(500).json({ error: 'Error fetching lots' }); }
};

export const createLot = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(ParkingLot);
        const lot = repo.create(req.body);
        await repo.save(lot);
        res.json(lot);
    } catch (error) { res.status(500).json({ error: 'Error creating lot' }); }
};

export const updateLot = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(ParkingLot);
        await repo.update(req.params.id, req.body);
        const lot = await repo.findOneBy({ lotID: parseInt(req.params.id) });
        res.json(lot);
    } catch (error) { res.status(500).json({ error: 'Error updating lot' }); }
};

export const deleteLot = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(ParkingLot);
        await repo.delete(req.params.id);
        res.json({ message: 'Lot deleted' });
    } catch (error) { res.status(500).json({ error: 'Error deleting lot' }); }
};

// --- Vehicles ---
export const getVehicles = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(Vehicle);
        const vehicles = await repo.find({ relations: ["campusUser"] });
        res.json(vehicles);
    } catch (error) { res.status(500).json({ error: 'Error fetching vehicles' }); }
};

export const createVehicle = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(Vehicle);
        const vehicle = repo.create(req.body);
        await repo.save(vehicle);
        res.json(vehicle);
    } catch (error) { res.status(500).json({ error: 'Error creating vehicle' }); }
};

export const updateVehicle = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(Vehicle);
        await repo.update(req.params.id, req.body);
        const vehicle = await repo.findOneBy({ vehicleID: parseInt(req.params.id) });
        res.json(vehicle);
    } catch (error) { res.status(500).json({ error: 'Error updating vehicle' }); }
};

export const deleteVehicle = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(Vehicle);
        await repo.delete(req.params.id);
        res.json({ message: 'Vehicle deleted' });
    } catch (error) { res.status(500).json({ error: 'Error deleting vehicle' }); }
};

// --- Permits ---
export const getPermits = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(Permit);
        const permits = await repo.find({ relations: ["vehicle", "zone"] });
        res.json(permits);
    } catch (error) { res.status(500).json({ error: 'Error fetching permits' }); }
};

export const createPermit = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(Permit);
        const permit = repo.create(req.body);
        await repo.save(permit);
        res.json(permit);
    } catch (error) { res.status(500).json({ error: 'Error creating permit' }); }
};

export const updatePermit = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(Permit);
        await repo.update(req.params.id, req.body);
        const permit = await repo.findOneBy({ permitID: parseInt(req.params.id) });
        res.json(permit);
    } catch (error) { res.status(500).json({ error: 'Error updating permit' }); }
};

export const deletePermit = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(Permit);
        await repo.delete(req.params.id);
        res.json({ message: 'Permit deleted' });
    } catch (error) { res.status(500).json({ error: 'Error deleting permit' }); }
};

// --- Reservations ---
export const getReservations = async (req: Request, res: Response) => {
    const { search } = getPaginationParams(req);
    try {
        const repo = AppDataSource.getRepository(Reservation);
        const where: any = [];
        if (search) {
            where.push({ proofCode: Like(`%${search}%`) });
        }

        const reservations = await repo.find({
            where: where.length > 0 ? where : undefined,
            relations: ["vehicle", "vehicle.campusUser", "lot", "zone"],
            order: { createdDateTime: 'DESC' },
            take: 100
        });
        res.json(reservations);
    } catch (error) { res.status(500).json({ error: 'Error fetching reservations' }); }
};

export const updateReservationStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const repo = AppDataSource.getRepository(Reservation);
        await repo.update(id, { status });
        const reservation = await repo.findOne({ where: { reservationID: parseInt(id) }, relations: ["lot"] });

        if (reservation && (status === 'Cancelled' || status === 'Completed')) {
            const lotRepo = AppDataSource.getRepository(ParkingLot);
            await lotRepo.update(reservation.lotID, { status: 'Available' });
        }

        res.json(reservation);
    } catch (error) { res.status(500).json({ error: 'Error updating reservation' }); }
};

export const cancelReservation = async (req: Request, res: Response) => {
    req.body.status = 'Cancelled';
    return updateReservationStatus(req, res);
};

// --- Sessions (Check-in / Check-out) ---
export const getSessions = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(ParkingSession);
        const sessions = await repo.find({
            relations: ["vehicle", "vehicle.campusUser", "lot", "reservation"],
            order: { entryTime: 'DESC' },
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

        const vehicleRepo = AppDataSource.getRepository(Vehicle);
        const vehicle = await vehicleRepo.findOne({ where: { plateNum } });
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found. Please register vehicle first.' });
        }
        vehicleID = vehicle.vehicleID;

        if (proofCode) {
            const resRepo = AppDataSource.getRepository(Reservation);
            const reservation = await resRepo.findOne({ where: { proofCode } });
            if (reservation) {
                if (reservation.vehicleID !== vehicleID) {
                    return res.status(400).json({ error: 'Reservation does not match vehicle' });
                }
                reservationID = reservation.reservationID;
                await resRepo.update(reservationID, { status: 'CheckedIn' });
            }
        }

        const sessionRepo = AppDataSource.getRepository(ParkingSession);
        const session = sessionRepo.create({
            vehicleID,
            lotID,
            reservationID: reservationID || undefined,
            entryTime: new Date(),
            sessionType: reservationID ? 'Reservation' : 'WalkIn'
        });
        await sessionRepo.save(session);

        const lotRepo = AppDataSource.getRepository(ParkingLot);
        await lotRepo.update(lotID, { status: 'Occupied' });

        res.json(session);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Check-in failed' });
    }
};

export const checkOut = async (req: Request, res: Response) => {
    const { sessionID } = req.params;
    try {
        const sessionRepo = AppDataSource.getRepository(ParkingSession);
        await sessionRepo.update(sessionID, { exitTime: new Date() });
        const session = await sessionRepo.findOne({ where: { sessionID: parseInt(sessionID) }, relations: ["lot"] });

        if (session) {
            const lotRepo = AppDataSource.getRepository(ParkingLot);
            await lotRepo.update(session.lotID, { status: 'Available' });

            if (session.reservationID) {
                const resRepo = AppDataSource.getRepository(Reservation);
                await resRepo.update(session.reservationID, { status: 'Completed' });
            }
        }

        res.json(session);
    } catch (error) { res.status(500).json({ error: 'Check-out failed' }); }
};

// --- Fines ---
export const getFines = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(Fine);
        const fines = await repo.find({
            relations: ["session", "session.vehicle", "session.vehicle.campusUser", "admin"],
            order: { issuedDate: 'DESC' }
        });
        res.json(fines);
    } catch (error) { res.status(500).json({ error: 'Error fetching fines' }); }
};

export const issueFine = async (req: Request, res: Response) => {
    const { sessionID, fineType, amount, remarks } = req.body;
    // @ts-ignore
    const adminID = req.user?.adminID || 1;

    try {
        const fineRepo = AppDataSource.getRepository(Fine);
        const fine = fineRepo.create({
            sessionID,
            adminID,
            fineType,
            amount: parseFloat(amount),
            status: 'Unpaid',
            remarks
        });
        await fineRepo.save(fine);

        const sessionRepo = AppDataSource.getRepository(ParkingSession);
        await sessionRepo.update(sessionID, { isViolation: true });

        res.json(fine);
    } catch (error) { res.status(500).json({ error: 'Error issuing fine' }); }
};

// --- Payments ---
export const getPayments = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(Payment);
        const payments = await repo.find({
            relations: ["fine", "admin"],
            order: { paymentDate: 'DESC' }
        });
        res.json(payments);
    } catch (error) { res.status(500).json({ error: 'Error fetching payments' }); }
};

export const recordPayment = async (req: Request, res: Response) => {
    const { fineID, amountPaid, receiptNum } = req.body;
    // @ts-ignore
    const adminID = req.user?.adminID || 1;

    try {
        const paymentRepo = AppDataSource.getRepository(Payment);
        const payment = paymentRepo.create({
            fineID,
            adminID,
            amountPaid: parseFloat(amountPaid),
            paymentMethod: 'Cash',
            receiptNum,
            paymentDate: new Date()
        });
        await paymentRepo.save(payment);

        const fineRepo = AppDataSource.getRepository(Fine);
        const fine = await fineRepo.findOne({ where: { fineID }, relations: ["payments"] });

        if (fine) {
            const totalPaid = fine.payments.reduce((sum, p) => sum + p.amountPaid, 0);
            if (totalPaid >= fine.amount) {
                await fineRepo.update(fineID, { status: 'Paid' });
            }
        }

        res.json(payment);
    } catch (error) { res.status(500).json({ error: 'Error recording payment' }); }
};

export const getRecentActivity = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(Reservation);
        const recentReservations = await repo.find({
            take: 5,
            order: { createdDateTime: 'DESC' },
            relations: ["vehicle", "vehicle.campusUser", "zone", "lot"]
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
