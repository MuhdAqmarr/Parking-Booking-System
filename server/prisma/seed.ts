import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // 1. Clean up existing data
    console.log('Cleaning up old data...');
    await prisma.payment.deleteMany();
    await prisma.fine.deleteMany();
    await prisma.parkingSession.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.permit.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.parkingLot.deleteMany();
    await prisma.parkingZone.deleteMany();
    await prisma.campusUser.deleteMany();
    await prisma.faculty.deleteMany();
    await prisma.admin.deleteMany();

    // Reset auto-increment counters (SQLite specific)
    try {
        await prisma.$executeRawUnsafe("DELETE FROM sqlite_sequence");
        console.log('Auto-increment counters reset.');
    } catch (error) {
        console.log('Could not reset sqlite_sequence (might not exist or not using SQLite).');
    }

    // 2. Seed Faculties
    console.log('Seeding Faculties...');
    const facultiesData = [
        { facultyName: 'College of Engineering', facultyCode: 'CE', locationDesc: 'Engineering Complex (Tuanku Abdul Halim Mu\'adzam Shah)' },
        { facultyName: 'Faculty of Law', facultyCode: 'LW', locationDesc: 'Faculty of Law Complex (Jalan Sarjana 1/2)' },
        { facultyName: 'Faculty of Computer & Mathematical Sciences', facultyCode: 'CS', locationDesc: 'Bangunan Al-Khawarizmi (Kompleks FSKM)' },
        { facultyName: 'Faculty of Applied Sciences', facultyCode: 'AS', locationDesc: 'Faculty of Applied Sciences Complex (Block C)' },
        { facultyName: 'Faculty of Sports Science & Recreation', facultyCode: 'SR', locationDesc: 'Faculty of Sports Science & Recreation Complex' },
        { facultyName: 'College of Built Environment', facultyCode: 'CF/AP', locationDesc: 'Kompleks Tahir Majid' },
        { facultyName: 'College of Creative Arts', facultyCode: 'CA', locationDesc: 'Kompleks Ilham' },
        { facultyName: 'Faculty of Communication & Media Studies', facultyCode: 'MC', locationDesc: 'Kompleks FKPM (Mass Comm Complex)' },
        { facultyName: 'Academy of Language Studies', facultyCode: 'LG', locationDesc: 'Academy of Language Studies Complex' },
        { facultyName: 'Academy of Contemporary Islamic Studies', facultyCode: 'IC', locationDesc: 'ACIS Building (Citra Complex)' },
        { facultyName: 'Faculty of Administrative Science & Policy', facultyCode: 'AM', locationDesc: 'FSPPP Complex / Menara SAAS' },
    ];

    for (const f of facultiesData) {
        await prisma.faculty.create({ data: f });
    }

    const allFaculties = await prisma.faculty.findMany();
    const csFaculty = allFaculties.find(f => f.facultyCode === 'CS');

    if (!csFaculty) throw new Error('CS Faculty not found');

    // 3. Seed Campus Users
    console.log('Seeding Campus Users...');

    // Student Data (Real Names)
    const students = [
        { fullName: 'Muhammad Aqmar Bin Khilmie', studentNo: '2023667106', email: '2023667106@student.uitm.edu.my', phoneNum: '0142338261', facultyCode: 'CS' },
        { fullName: 'MUHAMMAD SYAFIQ BIN JASMI', studentNo: '2024453024', email: '2024453024@student.uitm.edu.my', phoneNum: '01122435661', facultyCode: 'CS' },
        { fullName: 'MUHAMMAD IZZAT BIN MAHAMAD SOBRI', studentNo: '2025110837', email: '2025110837@student.uitm.edu.my', phoneNum: '0137658101', facultyCode: 'CS' },
        { fullName: 'Nurul Izzah Binti Ahmad', studentNo: '2023482910', email: 'nurul.izzah@student.uitm.edu.my', phoneNum: '0123456789', facultyCode: 'AS' },
        { fullName: 'Ahmad Syakir Bin Rosli', studentNo: '2022837465', email: 'ahmad.syakir@student.uitm.edu.my', phoneNum: '0198765432', facultyCode: 'CE' },
        { fullName: 'Siti Aminah Binti Yusof', studentNo: '2024918273', email: 'siti.aminah@student.uitm.edu.my', phoneNum: '0176543210', facultyCode: 'LW' },
        { fullName: 'Muhamad Hafiz Bin Razali', studentNo: '2023192837', email: 'hafiz.razali@student.uitm.edu.my', phoneNum: '0134567890', facultyCode: 'SR' },
        { fullName: 'Nur Aina Binti Ismail', studentNo: '2025283746', email: 'nur.aina@student.uitm.edu.my', phoneNum: '0145678901', facultyCode: 'MC' },
        { fullName: 'Amirul Hakim Bin Zulkifli', studentNo: '2022374859', email: 'amirul.hakim@student.uitm.edu.my', phoneNum: '0167890123', facultyCode: 'CA' },
        { fullName: 'Farah Nabilah Binti Omar', studentNo: '2024827364', email: 'farah.nabilah@student.uitm.edu.my', phoneNum: '0189012345', facultyCode: 'AM' },
    ];

    for (const s of students) {
        const faculty = allFaculties.find(f => f.facultyCode === s.facultyCode) || allFaculties[0];
        await prisma.campusUser.create({
            data: {
                fullName: s.fullName,
                studentNo: s.studentNo,
                email: s.email,
                phoneNum: s.phoneNum,
                userType: 'Student',
                status: 'Active',
                facultyID: faculty.facultyID,
            }
        });
    }

    // Staff Data (Real Names)
    const staff = [
        { fullName: 'DR. NOR DIANA BINTI AHMAD', staffNo: 'ST110100', email: 'diana12@uitm.edu.my', phoneNum: '0178865432', facultyCode: 'CS' },
        { fullName: 'Prof. Madya Dr. Azman Bin Ali', staffNo: 'ST102938', email: 'azman.ali@uitm.edu.my', phoneNum: '0129876543', facultyCode: 'CE' },
        { fullName: 'Dr. Siti Sarah Binti Abdullah', staffNo: 'ST293847', email: 'siti.sarah@uitm.edu.my', phoneNum: '0138765432', facultyCode: 'AS' },
        { fullName: 'Encik Mohd Rizal Bin Hassan', staffNo: 'ST384756', email: 'rizal.hassan@uitm.edu.my', phoneNum: '0147654321', facultyCode: 'SR' },
        { fullName: 'Puan Norliza Binti Zakaria', staffNo: 'ST475610', email: 'norliza.zakaria@uitm.edu.my', phoneNum: '0166543210', facultyCode: 'LW' },
        { fullName: 'Dr. Khairul Anuar Bin Mat', staffNo: 'ST561029', email: 'khairul.anuar@uitm.edu.my', phoneNum: '0175432109', facultyCode: 'MC' },
        { fullName: 'Puan Rosnah Binti Che Mat', staffNo: 'ST610293', email: 'rosnah.chemat@uitm.edu.my', phoneNum: '0184321098', facultyCode: 'CA' },
        { fullName: 'Encik Zulkarnain Bin Daud', staffNo: 'ST702938', email: 'zulkarnain.daud@uitm.edu.my', phoneNum: '0193210987', facultyCode: 'AM' },
        { fullName: 'Dr. Faridah Binti Mustafa', staffNo: 'ST829374', email: 'faridah.mustafa@uitm.edu.my', phoneNum: '0112109876', facultyCode: 'LG' },
        { fullName: 'Prof. Dr. Lim Wei Chong', staffNo: 'ST938475', email: 'lim.weichong@uitm.edu.my', phoneNum: '0121098765', facultyCode: 'IC' },
    ];

    for (const s of staff) {
        const faculty = allFaculties.find(f => f.facultyCode === s.facultyCode) || allFaculties[0];
        await prisma.campusUser.create({
            data: {
                fullName: s.fullName,
                staffNo: s.staffNo,
                email: s.email,
                phoneNum: s.phoneNum,
                userType: 'Staff',
                status: 'Active',
                facultyID: faculty.facultyID,
            }
        });
    }

    // 4. Seed Parking Zones and Lots
    console.log('Seeding Parking Zones and Lots...');

    for (const faculty of allFaculties) {
        // Create 3 zones per faculty
        const zones = [
            { name: 'Zone A', type: 'Staff', capacity: 30 },
            { name: 'Zone B', type: 'Student', capacity: 50 },
            { name: 'Zone C', type: 'Visitor', capacity: 20 },
        ];

        for (const z of zones) {
            const zone = await prisma.parkingZone.create({
                data: {
                    facultyID: faculty.facultyID,
                    zoneName: `${faculty.facultyCode} - ${z.name}`,
                    zoneType: z.type,
                    capacity: z.capacity,
                    locationDesc: `Near ${faculty.facultyName} main entrance`,
                }
            });

            // Create 10 lots per zone (including 2 disabled)
            for (let i = 1; i <= 10; i++) {
                await prisma.parkingLot.create({
                    data: {
                        zoneID: zone.zoneID,
                        lotNumber: `${zone.zoneName.split(' - ')[0]}-${z.name.split(' ')[1]}-${i.toString().padStart(3, '0')}`,
                        status: 'Available',
                        isDisabledFriendly: i <= 2, // First 2 are disabled friendly
                    }
                });
            }
        }
    }

    // 5. Seed Default Admin
    console.log('Seeding Admin...');
    await prisma.admin.create({
        data: {
            adminName: 'System Admin',
            username: 'admin',
            passwordHash: bcrypt.hashSync('admin123', 10),
            email: 'admin@system.com',
            role: 'SuperAdmin',
        }
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
