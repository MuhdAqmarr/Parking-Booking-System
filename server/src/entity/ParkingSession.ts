import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from "typeorm";
import { ParkingLot } from "./ParkingLot.js";
import { Vehicle } from "./Vehicle.js";
import { Reservation } from "./Reservation.js";
import { Fine } from "./Fine.js";

@Entity("PARKING_SESSION")
export class ParkingSession {
    @PrimaryGeneratedColumn()
    sessionID!: number;

    @Column("number")
    lotID!: number;

    @Column("number")
    vehicleID!: number;

    @Column("number", { nullable: true })
    reservationID!: number;

    @CreateDateColumn()
    entryTime!: Date;

    @Column("date", { nullable: true })
    exitTime!: Date;

    @Column("varchar2")
    sessionType!: string;

    @Column("number", { default: 0 })
    isViolation!: boolean;

    @ManyToOne(() => ParkingLot, (lot) => lot.parkingSessions)
    @JoinColumn({ name: "lotID" })
    lot!: ParkingLot;

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.parkingSessions)
    @JoinColumn({ name: "vehicleID" })
    vehicle!: Vehicle;

    @ManyToOne(() => Reservation, (res) => res.parkingSessions)
    @JoinColumn({ name: "reservationID" })
    reservation!: Reservation;

    @OneToMany(() => Fine, (fine) => fine.session)
    fines!: Fine[];
}
