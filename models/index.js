import { Sequelize, DataTypes, Model } from "sequelize";
import config from "../config.js";

const { dialect, storage } = config.database;
export const sequelize = new Sequelize({ dialect, storage });

export class User extends Model {}
export class RefreshToken extends Model {}

User.init({
  username: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING }
}, { sequelize });

RefreshToken.init({
  token: { type: DataTypes.STRING },
  expiresAt: { type: DataTypes.DATE },
  userId: { type: DataTypes.INTEGER }
}, { sequelize });

User.hasMany(RefreshToken, { foreignKey: "userId" });
RefreshToken.belongsTo(User, { foreignKey: "userId" });
