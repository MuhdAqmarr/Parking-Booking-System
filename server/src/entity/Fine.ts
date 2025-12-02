import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from "typeorm";
import { ParkingSession } from "./ParkingSession.js";
import { Admin } from "./Admin.js";
import { Payment } from "./Payment.js";

@Entity("FINE")
export class Fine {
    @PrimaryGeneratedColumn()
    fineID!: number;

    @Column("number")
    sessionID!: number;

    @Column("number")
    adminID!: number;

    @CreateDateColumn()
    issuedDate!: Date;

    @Column("varchar2")
    fineType!: string;

    @Column("float")
    amount!: number;

    @Column("varchar2")
    status!: string;

    @Column("varchar2", { nullable: true })
    remarks!: string;

    @ManyToOne(() => ParkingSession, (session) => session.fines)
    @JoinColumn({ name: "sessionID" })
    session!: ParkingSession;

    @ManyToOne(() => Admin, (admin) => admin.fines)
    @JoinColumn({ name: "adminID" })
    admin!: Admin;

    @OneToMany(() => Payment, (payment) => payment.fine)
    payments!: Payment[];
}
