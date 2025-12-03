import { Request, Response } from 'express';
import { AppDataSource } from '../data-source.js';
import { CampusUser } from '../entity/CampusUser.js';
import { Faculty } from '../entity/Faculty.js';
import { ParkingZone } from '../entity/ParkingZone.js';
import { ParkingLot } from '../entity/ParkingLot.js';
import { Reservation } from '../entity/Reservation.js';
import { Vehicle } from '../entity/Vehicle.js';
import { Fine } from '../entity/Fine.js';
import { Payment } from '../entity/Payment.js';
import { Admin } from '../entity/Admin.js';
import Stripe from 'stripe';
import { LessThan, MoreThan, In } from 'typeorm';

const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const stripe = new Stripe(stripeKey, {
    // apiVersion: '2024-11-20.acacia',
});

export const verifyCampusUser = async (req: Request, res: Response) => {
    const { userType, studentNo, staffNo } = req.body;

    try {
        const where: any = { userType, status: 'Active' };
        if (userType === 'Student') where.studentNo = studentNo;
        if (userType === 'Staff') where.staffNo = staffNo;

        const userRepo = AppDataSource.getRepository(CampusUser);
        const user = await userRepo.findOne({ where });

        if (!user) {
            res.status(404).json({ error: 'User not found or inactive' });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Verification failed' });
    }
};

export const getFaculties = async (req: Request, res: Response) => {
    try {
        const facultyRepo = AppDataSource.getRepository(Faculty);
        const faculties = await facultyRepo.find();
        res.json(faculties);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch faculties' });
    }
};

export const getZones = async (req: Request, res: Response) => {
    const { facultyID } = req.query;
    try {
        const zoneRepo = AppDataSource.getRepository(ParkingZone);
        const zones = await zoneRepo.find({
            where: { facultyID: Number(facultyID) },
        });
        res.json(zones);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch zones' });
    }
};

export const getAvailableLots = async (req: Request, res: Response) => {
    const { zoneID, date, startTime, endTime } = req.query;

    try {
        if (!zoneID || !date || !startTime || !endTime) {
            res.status(400).json({ error: 'Missing required parameters' });
            return;
        }

        const startDateTime = new Date(`${date}T${startTime}:00`);
        const endDateTime = new Date(`${date}T${endTime}:00`);
        const reservationDate = new Date(`${date}T00:00:00`);

        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            res.status(400).json({ error: 'Invalid date or time format' });
            return;
        }

        const lotRepo = AppDataSource.getRepository(ParkingLot);

        const lots = await lotRepo.find({
            where: { zoneID: Number(zoneID), status: 'Available' },
            relations: ["reservations"]
        });

        const result = lots.map(lot => {
            const hasConflict = lot.reservations?.some(res => {
                const resDate = new Date(res.reservationDate);
                const resStart = new Date(res.startTime);
                const resEnd = new Date(res.endTime);

                // Check if dates match (ignoring time component of reservationDate)
                const isSameDate = resDate.getFullYear() === reservationDate.getFullYear() &&
                    resDate.getMonth() === reservationDate.getMonth() &&
                    resDate.getDate() === reservationDate.getDate();

                return isSameDate &&
                    ['Reserved', 'CheckedIn'].includes(res.status) &&
                    resStart < endDateTime &&
                    resEnd > startDateTime;
            });
            return {
                ...lot,
                isReserved: hasConflict || false
            };
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch lots' });
    }
};

export const createReservation = async (req: Request, res: Response) => {
    const {
        userType, studentNo, staffNo, name, email, phoneNum,
        plateNum, vehicleType, reservationDate, startTime, endTime,
        facultyID, zoneID, lotID
    } = req.body;

    try {
        let campusUserID: number | null = null;
        let ownerName = name;
        let contactNum = phoneNum;

        if (userType !== 'Visitor') {
            const userRepo = AppDataSource.getRepository(CampusUser);
            const where: any = { userType, status: 'Active' };
            if (userType === 'Student') where.studentNo = studentNo;
            if (userType === 'Staff') where.staffNo = staffNo;

            const user = await userRepo.findOne({ where });
            if (!user) {
                res.status(400).json({ error: 'Invalid campus user' });
                return;
            }
            campusUserID = user.campusUserID;
            ownerName = user.fullName;
            contactNum = user.phoneNum || phoneNum;
        }

        const zoneRepo = AppDataSource.getRepository(ParkingZone);
        const zone = await zoneRepo.findOne({ where: { zoneID } });
        if (!zone) {
            res.status(400).json({ error: 'Zone not found' });
            return;
        }
        const allowed =
            (userType === 'Staff' && ['Staff', 'Mixed'].includes(zone.zoneType)) ||
            (userType === 'Student' && ['Student', 'Mixed'].includes(zone.zoneType)) ||
            (userType === 'Visitor' && ['Visitor', 'Mixed'].includes(zone.zoneType));

        if (!allowed) {
            res.status(400).json({ error: `Zone type ${zone.zoneType} not allowed for ${userType}` });
            return;
        }

        const start = new Date(`${reservationDate}T${startTime}:00`);
        const end = new Date(`${reservationDate}T${endTime}:00`);
        const rDate = new Date(`${reservationDate}T00:00:00`);

        const resRepo = AppDataSource.getRepository(Reservation);
        const conflict = await resRepo.findOne({
            where: {
                lotID,
                reservationDate: rDate,
                status: In(['Reserved', 'CheckedIn']),
                startTime: LessThan(end),
                endTime: MoreThan(start)
            }
        });

        if (conflict) {
            res.status(400).json({ error: 'Lot already reserved for this time' });
            return;
        }

        const vehicleRepo = AppDataSource.getRepository(Vehicle);
        let vehicle = await vehicleRepo.findOne({ where: { plateNum } });
        if (!vehicle) {
            vehicle = vehicleRepo.create({
                plateNum,
                vehicleType,
                ownerName,
                ownerType: userType,
                contactNum,
                campusUserID: campusUserID || undefined
            });
            await vehicleRepo.save(vehicle);
        }

        const proofCode = Math.random().toString(36).substring(2, 10).toUpperCase();

        const reservation = resRepo.create({
            facultyID,
            zoneID,
            lotID,
            vehicleID: vehicle.vehicleID,
            reservationDate: rDate,
            startTime: start,
            endTime: end,
            status: 'Reserved',
            userType,
            proofCode
        });
        await resRepo.save(reservation);

        res.json({ reservation, proofCode });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Reservation failed' });
    }
};

export const getReservation = async (req: Request, res: Response) => {
    const { proofCode } = req.params;
    try {
        const resRepo = AppDataSource.getRepository(Reservation);
        const reservation = await resRepo.findOne({
            where: { proofCode },
            relations: ["faculty", "zone", "lot", "vehicle"]
        });
        if (!reservation) {
            res.status(404).json({ error: 'Reservation not found' });
            return;
        }
        res.json(reservation);
    } catch (error) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};

export const getFines = async (req: Request, res: Response) => {
    const { plateNum, studentNo, staffNo } = req.query;
    try {
        const fineRepo = AppDataSource.getRepository(Fine);
        const query = fineRepo.createQueryBuilder("fine")
            .leftJoinAndSelect("fine.session", "session")
            .leftJoinAndSelect("session.vehicle", "vehicle")
            .leftJoinAndSelect("vehicle.campusUser", "campusUser")
            .where("fine.status = :status", { status: 'Unpaid' });

        if (plateNum) {
            query.andWhere("vehicle.plateNum = :plateNum", { plateNum });
        } else if (studentNo) {
            query.andWhere("campusUser.studentNo = :studentNo", { studentNo });
        } else if (staffNo) {
            query.andWhere("campusUser.staffNo = :staffNo", { staffNo });
        } else {
            res.status(400).json({ error: 'Provide plateNum, studentNo or staffNo' });
            return;
        }

        const fines = await query.getMany();
        res.json(fines);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Fetch fines failed' });
    }
};

export const payFine = async (req: Request, res: Response) => {
    const { fineID } = req.params;
    try {
        const fineRepo = AppDataSource.getRepository(Fine);
        const fine = await fineRepo.findOne({ where: { fineID: Number(fineID) } });
        if (!fine || fine.status !== 'Unpaid') {
            res.status(400).json({ error: 'Invalid fine' });
            return;
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'fpx'],
            line_items: [{
                price_data: {
                    currency: 'myr',
                    product_data: {
                        name: `Fine Payment #${fine.fineID}`,
                        description: fine.remarks || 'Parking Violation',
                    },
                    unit_amount: Math.round(fine.amount * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `http://localhost:5173/fines?success=true&fineID=${fine.fineID}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:5173/fines?canceled=true`,
            metadata: {
                fineID: fine.fineID.toString()
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Payment initiation failed' });
    }
};

export const confirmFinePayment = async (req: Request, res: Response) => {
    const { session_id } = req.body;
    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status !== 'paid') {
            res.status(400).json({ error: 'Payment not completed' });
            return;
        }

        const fineID = session.metadata?.fineID;
        if (!fineID) {
            res.status(400).json({ error: 'Invalid session metadata' });
            return;
        }

        const fineRepo = AppDataSource.getRepository(Fine);
        const fine = await fineRepo.findOne({ where: { fineID: Number(fineID) } });

        if (fine) {
            // Prevent duplicate processing
            if (fine.status === 'Paid') {
                res.json({ success: true, message: 'Already processed' });
                return;
            }

            fine.status = 'Paid';
            await fineRepo.save(fine);

            // Record the payment
            const paymentRepo = AppDataSource.getRepository(Payment);
            const adminRepo = AppDataSource.getRepository(Admin);

            // Assign to first admin (System) since it's an automated payment
            const systemAdmin = await adminRepo.findOne({ where: {} });

            const payment = paymentRepo.create({
                fineID: fine.fineID,
                adminID: systemAdmin?.adminID || 1, // Fallback to 1 if no admin found
                amountPaid: fine.amount,
                paymentMethod: 'Stripe',
                gatewayRef: session.id,
                paymentDate: new Date(),
                receiptNum: `RCPT-${Date.now()}`
            });
            await paymentRepo.save(payment);

            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Fine not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Confirmation failed' });
    }
};

export const getAnnouncements = async (req: Request, res: Response) => {
    const announcements = [
        { id: 1, message: "Zone C under maintenance until 14 March.", type: "info" },
        { id: 2, message: "Event Mode active on Friday – Zone E reserved for Convocation.", type: "warning" }
    ];
    res.json(announcements);
};

export const getOverview = async (req: Request, res: Response) => {
    try {
        const lotRepo = AppDataSource.getRepository(ParkingLot);
        const resRepo = AppDataSource.getRepository(Reservation);

        // We need to join with Zone to filter by zoneType
        const countLots = async (zoneType: string, status?: string) => {
            const where: any = { zone: { zoneType } };
            if (status) where.status = status;
            return await lotRepo.count({ where, relations: ["zone"] });
        };

        const totalStaffLots = await countLots('Staff');
        const occupiedStaffLots = await countLots('Staff', 'Occupied');

        const totalStudentLots = await countLots('Student');
        const occupiedStudentLots = await countLots('Student', 'Occupied');

        const totalVisitorLots = await countLots('Visitor');
        const occupiedVisitorLots = await countLots('Visitor', 'Occupied');

        const totalFreeLots = await lotRepo.count({ where: { status: 'Available' } });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const totalReservedToday = await resRepo.count({
            where: {
                reservationDate: today
            }
        });

        res.json({
            staffOccupancy: totalStaffLots ? occupiedStaffLots / totalStaffLots : 0,
            studentOccupancy: totalStudentLots ? occupiedStudentLots / totalStudentLots : 0,
            visitorOccupancy: totalVisitorLots ? occupiedVisitorLots / totalVisitorLots : 0,
            totalFreeLots,
            totalReservedToday
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch overview' });
    }
};

export const findReservation = async (req: Request, res: Response) => {
    const { plateNum } = req.body;
    try {
        const resRepo = AppDataSource.getRepository(Reservation);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const reservation = await resRepo.findOne({
            where: {
                vehicle: { plateNum: String(plateNum) },
                status: In(['Reserved', 'CheckedIn']),
                reservationDate: MoreThan(today) // or gte
            },
            order: { reservationDate: 'ASC' },
            relations: ["vehicle"]
        });

        if (!reservation) {
            res.status(404).json({ error: 'No active reservation found for this vehicle.' });
            return;
        }

        res.json({ proofCode: reservation.proofCode });
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
};
