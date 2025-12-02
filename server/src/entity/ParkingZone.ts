import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Faculty } from "./Faculty.js";
import { ParkingLot } from "./ParkingLot.js";
import { Permit } from "./Permit.js";
import { Reservation } from "./Reservation.js";

@Entity("PARKING_ZONE")
export class ParkingZone {
    @PrimaryGeneratedColumn()
    zoneID!: number;

    @Column("number")
    facultyID!: number;

    @Column("varchar2")
    zoneName!: string;

    @Column("varchar2")
    zoneType!: string;

    @Column("number")
    capacity!: number;

    @Column("varchar2", { nullable: true })
    locationDesc!: string;

    @ManyToOne(() => Faculty, (faculty) => faculty.parkingZones)
    @JoinColumn({ name: "facultyID" })
    faculty!: Faculty;

    @OneToMany(() => ParkingLot, (lot) => lot.zone)
    parkingLots!: ParkingLot[];

    @OneToMany(() => Permit, (permit) => permit.zone)
    permits!: Permit[];

    @OneToMany(() => Reservation, (res) => res.zone)
    reservations!: Reservation[];
}
