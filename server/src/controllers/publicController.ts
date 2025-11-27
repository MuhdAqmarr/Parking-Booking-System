import { Request, Response } from 'express';
import prisma from '../prisma.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    // apiVersion: '2024-11-20.acacia',
});

export const verifyCampusUser = async (req: Request, res: Response) => {
    const { userType, studentNo, staffNo } = req.body;

    try {
        const where: any = { userType, status: 'Active' };
        if (userType === 'Student') where.studentNo = studentNo;
        if (userType === 'Staff') where.staffNo = staffNo;

        const user = await prisma.campusUser.findFirst({ where });

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
        const faculties = await prisma.faculty.findMany();
        res.json(faculties);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch faculties' });
    }
};

export const getZones = async (req: Request, res: Response) => {
    const { facultyID } = req.query;
    try {
        const zones = await prisma.parkingZone.findMany({
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
        // Validate inputs
        if (!zoneID || !date || !startTime || !endTime) {
            res.status(400).json({ error: 'Missing required parameters' });
            return;
        }

        // Parse dates with proper ISO format - add seconds
        const startDateTime = new Date(`${date}T${startTime}:00`);
        const endDateTime = new Date(`${date}T${endTime}:00`);
        const reservationDate = new Date(`${date}T00:00:00`);

        // Validate parsed dates
        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            res.status(400).json({ error: 'Invalid date or time format' });
            return;
        }

        const lots = await prisma.parkingLot.findMany({
            where: { zoneID: Number(zoneID), status: 'Available' },
            include: {
                reservations: {
                    where: {
                        reservationDate: reservationDate,
                        status: { in: ['Reserved', 'CheckedIn'] },
                        AND: [
                            { startTime: { lt: endDateTime } },
                            { endTime: { gt: startDateTime } }
                        ]
                    }
                }
            }
        });

        const result = lots.map(lot => ({
            ...lot,
            isReserved: lot.reservations.length > 0
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch lots' });
    }
};

export const createReservation = async (req: Request, res: Response) => {
    const {
        userType,
        studentNo,
        staffNo,
        name,
        email,
        phoneNum,
        plateNum,
        vehicleType,
        reservationDate,
        startTime,
        endTime,
        facultyID,
        zoneID,
        lotID
    } = req.body;

    try {
        let campusUserID: number | null = null;
        let ownerName = name;
        let contactNum = phoneNum;

        if (userType !== 'Visitor') {
            const where: any = { userType, status: 'Active' };
            if (userType === 'Student') where.studentNo = studentNo;
            if (userType === 'Staff') where.staffNo = staffNo;
            const user = await prisma.campusUser.findFirst({ where });
            if (!user) {
                res.status(400).json({ error: 'Invalid campus user' });
                return;
            }
            campusUserID = user.campusUserID;
            ownerName = user.fullName;
            contactNum = user.phoneNum || phoneNum;
        }

        const zone = await prisma.parkingZone.findUnique({ where: { zoneID } });
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

        // Parse dates properly with seconds
        const start = new Date(`${reservationDate}T${startTime}:00`);
        const end = new Date(`${reservationDate}T${endTime}:00`);
        const rDate = new Date(`${reservationDate}T00:00:00`);

        const conflict = await prisma.reservation.findFirst({
            where: {
                lotID,
                reservationDate: rDate,
                status: { in: ['Reserved', 'CheckedIn'] },
                AND: [
                    { startTime: { lt: end } },
                    { endTime: { gt: start } }
                ]
            }
        });

        if (conflict) {
            res.status(400).json({ error: 'Lot already reserved for this time' });
            return;
        }

        let vehicle = await prisma.vehicle.findUnique({ where: { plateNum } });
        if (!vehicle) {
            vehicle = await prisma.vehicle.create({
                data: {
                    plateNum,
                    vehicleType,
                    ownerName,
                    ownerType: userType,
                    contactNum,
                    campusUserID
                }
            });
        }

        const proofCode = Math.random().toString(36).substring(2, 10).toUpperCase();

        const reservation = await prisma.reservation.create({
            data: {
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
            }
        });

        res.json({ reservation, proofCode });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Reservation failed' });
    }
};

export const getReservation = async (req: Request, res: Response) => {
    const { proofCode } = req.params;
    try {
        const reservation = await prisma.reservation.findUnique({
            where: { proofCode },
            include: {
                faculty: true,
                zone: true,
                lot: true,
                vehicle: true
            }
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
        let where: any = { status: 'Unpaid' };

        if (plateNum) {
            where.session = { vehicle: { plateNum: String(plateNum) } };
        } else if (studentNo) {
            where.session = { vehicle: { campusUser: { studentNo: String(studentNo) } } };
        } else if (staffNo) {
            where.session = { vehicle: { campusUser: { staffNo: String(staffNo) } } };
        } else {
            res.status(400).json({ error: 'Provide plateNum, studentNo or staffNo' });
            return;
        }

        const fines = await prisma.fine.findMany({
            where,
            include: { session: { include: { vehicle: true } } }
        });
        res.json(fines);
    } catch (error) {
        res.status(500).json({ error: 'Fetch fines failed' });
    }
};

export const payFine = async (req: Request, res: Response) => {
    const { fineID } = req.params;
    try {
        const fine = await prisma.fine.findUnique({ where: { fineID: Number(fineID) } });
        if (!fine || fine.status !== 'Unpaid') {
            res.status(400).json({ error: 'Invalid fine' });
            return;
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Fine Payment #${fine.fineID}`,
                        description: fine.remarks || 'Parking Violation',
                    },
                    unit_amount: Math.round(fine.amount * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `http://localhost:5173/fines?success=true&fineID=${fine.fineID}`,
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

export const getAnnouncements = async (req: Request, res: Response) => {
    // Mock data
    const announcements = [
        { id: 1, message: "Zone C under maintenance until 14 March.", type: "info" },
        { id: 2, message: "Event Mode active on Friday – Zone E reserved for Convocation.", type: "warning" }
    ];
    res.json(announcements);
};

export const getOverview = async (req: Request, res: Response) => {
    try {
        const totalStaffLots = await prisma.parkingLot.count({ where: { zone: { zoneType: 'Staff' } } });
        const occupiedStaffLots = await prisma.parkingLot.count({ where: { zone: { zoneType: 'Staff' }, status: 'Occupied' } });

        const totalStudentLots = await prisma.parkingLot.count({ where: { zone: { zoneType: 'Student' } } });
        const occupiedStudentLots = await prisma.parkingLot.count({ where: { zone: { zoneType: 'Student' }, status: 'Occupied' } });

        const totalVisitorLots = await prisma.parkingLot.count({ where: { zone: { zoneType: 'Visitor' } } });
        const occupiedVisitorLots = await prisma.parkingLot.count({ where: { zone: { zoneType: 'Visitor' }, status: 'Occupied' } });

        const totalFreeLots = await prisma.parkingLot.count({ where: { status: 'Available' } });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const totalReservedToday = await prisma.reservation.count({
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
        const reservation = await prisma.reservation.findFirst({
            where: {
                vehicle: { plateNum: String(plateNum) },
                status: { in: ['Reserved', 'CheckedIn'] },
                reservationDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            },
            orderBy: { reservationDate: 'asc' }
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
