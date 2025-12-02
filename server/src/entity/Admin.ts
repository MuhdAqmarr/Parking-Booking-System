import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Fine } from "./Fine.js";
import { Payment } from "./Payment.js";

@Entity("ADMIN")
export class Admin {
    @PrimaryGeneratedColumn()
    adminID!: number;

    @Column("varchar2")
    adminName!: string;

    @Column("varchar2", { unique: true })
    username!: string;

    @Column("varchar2")
    passwordHash!: string;

    @Column("varchar2", { unique: true })
    email!: string;

    @Column("varchar2", { nullable: true })
    phoneNum!: string;

    @Column("varchar2")
    role!: string;

    @OneToMany(() => Fine, (fine) => fine.admin)
    fines!: Fine[];

    @OneToMany(() => Payment, (payment) => payment.admin)
    payments!: Payment[];
}
