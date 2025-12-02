import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { ParkingZone } from "./ParkingZone.js";
import { Reservation } from "./Reservation.js";
import { ParkingSession } from "./ParkingSession.js";

@Entity("PARKING_LOT")
export class ParkingLot {
    @PrimaryGeneratedColumn()
    lotID!: number;

    @Column("number")
    zoneID!: number;

    @Column("varchar2")
    lotNumber!: string;

    @Column("varchar2")
    status!: string;

    @Column("number", { default: 0 })
    isDisabledFriendly!: boolean;

    @ManyToOne(() => ParkingZone, (zone) => zone.parkingLots)
    @JoinColumn({ name: "zoneID" })
    zone!: ParkingZone;

    @OneToMany(() => Reservation, (res) => res.lot)
    reservations!: Reservation[];

    @OneToMany(() => ParkingSession, (session) => session.lot)
    parkingSessions!: ParkingSession[];
}
