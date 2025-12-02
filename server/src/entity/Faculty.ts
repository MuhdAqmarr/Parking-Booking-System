import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { CampusUser } from "./CampusUser.js";
import { ParkingZone } from "./ParkingZone.js";
import { Reservation } from "./Reservation.js";

@Entity("FACULTY")
export class Faculty {
    @PrimaryGeneratedColumn()
    facultyID!: number;

    @Column("varchar2")
    facultyName!: string;

    @Column("varchar2", { unique: true })
    facultyCode!: string;

    @Column("varchar2", { nullable: true })
    locationDesc!: string;

    @OneToMany(() => CampusUser, (user) => user.faculty)
    campusUsers!: CampusUser[];

    @OneToMany(() => ParkingZone, (zone) => zone.faculty)
    parkingZones!: ParkingZone[];

    @OneToMany(() => Reservation, (res) => res.faculty)
    reservations!: Reservation[];
}
