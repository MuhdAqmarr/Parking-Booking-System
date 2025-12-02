import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from "typeorm";
import { Faculty } from "./Faculty.js";
import { ParkingZone } from "./ParkingZone.js";
import { ParkingLot } from "./ParkingLot.js";
import { Vehicle } from "./Vehicle.js";
import { ParkingSession } from "./ParkingSession.js";

@Entity("RESERVATION")
export class Reservation {
    @PrimaryGeneratedColumn()
    reservationID!: number;

    @Column("number")
    facultyID!: number;

    @Column("number")
    zoneID!: number;

    @Column("number")
    lotID!: number;

    @Column("number")
    vehicleID!: number;

    @Column("date")
    reservationDate!: Date;

    @Column("date")
    startTime!: Date;

    @Column("date")
    endTime!: Date;

    @CreateDateColumn()
    createdDateTime!: Date;

    @Column("varchar2")
    status!: string;

    @Column("varchar2")
    userType!: string;

    @Column("varchar2", { unique: true })
    proofCode!: string;

    @ManyToOne(() => Faculty, (faculty) => faculty.reservations)
    @JoinColumn({ name: "facultyID" })
    faculty!: Faculty;

    @ManyToOne(() => ParkingZone, (zone) => zone.reservations)
    @JoinColumn({ name: "zoneID" })
    zone!: ParkingZone;

    @ManyToOne(() => ParkingLot, (lot) => lot.reservations)
    @JoinColumn({ name: "lotID" })
    lot!: ParkingLot;

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.reservations)
    @JoinColumn({ name: "vehicleID" })
    vehicle!: Vehicle;

    @OneToMany(() => ParkingSession, (session) => session.reservation)
    parkingSessions!: ParkingSession[];
}
