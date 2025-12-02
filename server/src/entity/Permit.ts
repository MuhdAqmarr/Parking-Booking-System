import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Vehicle } from "./Vehicle.js";
import { ParkingZone } from "./ParkingZone.js";

@Entity("PERMIT")
export class Permit {
    @PrimaryGeneratedColumn()
    permitID!: number;

    @Column("number")
    vehicleID!: number;

    @Column("number")
    zoneID!: number;

    @Column("varchar2")
    permitType!: string;

    @Column("date")
    startDate!: Date;

    @Column("date")
    endDate!: Date;

    @Column("varchar2")
    status!: string;

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.permits)
    @JoinColumn({ name: "vehicleID" })
    vehicle!: Vehicle;

    @ManyToOne(() => ParkingZone, (zone) => zone.permits)
    @JoinColumn({ name: "zoneID" })
    zone!: ParkingZone;
}
