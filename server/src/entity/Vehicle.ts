import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { CampusUser } from "./CampusUser.js";
import { Permit } from "./Permit.js";
import { Reservation } from "./Reservation.js";
import { ParkingSession } from "./ParkingSession.js";

@Entity("VEHICLE")
export class Vehicle {
    @PrimaryGeneratedColumn()
    vehicleID!: number;

    @Column("number", { nullable: true })
    campusUserID!: number;

    @Column("varchar2", { unique: true })
    plateNum!: string;

    @Column("varchar2")
    vehicleType!: string;

    @Column("varchar2")
    ownerName!: string;

    @Column("varchar2")
    ownerType!: string;

    @Column("varchar2", { nullable: true })
    contactNum!: string;

    @ManyToOne(() => CampusUser, (user) => user.vehicles)
    @JoinColumn({ name: "campusUserID" })
    campusUser!: CampusUser;

    @OneToMany(() => Permit, (permit) => permit.vehicle)
    permits!: Permit[];

    @OneToMany(() => Reservation, (res) => res.vehicle)
    reservations!: Reservation[];

    @OneToMany(() => ParkingSession, (session) => session.vehicle)
    parkingSessions!: ParkingSession[];
}
