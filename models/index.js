import { Sequelize, DataTypes, Model } from "sequelize";
import config from "../config.js";

const { dialect, storage } = config.database;
export const sequelize = new Sequelize({ dialect, storage });

export class User extends Model {}
export class AccessToken extends Model {}

User.init({
  pseudo: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING
}, { sequelize });

