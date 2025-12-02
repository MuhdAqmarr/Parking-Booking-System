import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Faculty } from "./Faculty.js";
import { Vehicle } from "./Vehicle.js";

@Entity("CAMPUS_USER")
export class CampusUser {
    @PrimaryGeneratedColumn()
    campusUserID!: number;

    @Column("number")
    facultyID!: number;

    @Column("varchar2")
    fullName!: string;

    @Column("varchar2")
    userType!: string;

    @Column("varchar2", { unique: true, nullable: true })
    studentNo!: string;

    @Column("varchar2", { unique: true, nullable: true })
    staffNo!: string;

    @Column("varchar2", { unique: true })
    email!: string;

    @Column("varchar2", { nullable: true })
    phoneNum!: string;

    @Column("varchar2")
    status!: string;

    @ManyToOne(() => Faculty, (faculty) => faculty.campusUsers)
    @JoinColumn({ name: "facultyID" })
    faculty!: Faculty;

    @OneToMany(() => Vehicle, (vehicle) => vehicle.campusUser)
    vehicles!: Vehicle[];
}
