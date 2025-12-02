import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "oracle",
    host: process.env.ORACLE_HOST || "localhost",
    port: parseInt(process.env.ORACLE_PORT || "1521"),
    username: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    sid: process.env.ORACLE_SID,
    serviceName: process.env.ORACLE_SERVICE_NAME,
    synchronize: true,
    logging: false,
    entities: ["src/entity/**/*.ts"],
    migrations: [],
    subscribers: [],
});
