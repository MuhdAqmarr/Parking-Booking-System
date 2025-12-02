import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Fine } from "./Fine.js";
import { Admin } from "./Admin.js";

@Entity("PAYMENT")
export class Payment {
    @PrimaryGeneratedColumn()
    paymentID!: number;

    @Column("number")
    fineID!: number;

    @Column("number")
    adminID!: number;

    @CreateDateColumn()
    paymentDate!: Date;

    @Column("float")
    amountPaid!: number;

    @Column("varchar2")
    paymentMethod!: string;

    @Column("varchar2", { nullable: true })
    receiptNum!: string;

    @Column("varchar2", { nullable: true })
    gatewayRef!: string;

    @ManyToOne(() => Fine, (fine) => fine.payments)
    @JoinColumn({ name: "fineID" })
    fine!: Fine;

    @ManyToOne(() => Admin, (admin) => admin.payments)
    @JoinColumn({ name: "adminID" })
    admin!: Admin;
}
