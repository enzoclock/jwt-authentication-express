import { sequelize } from "./index.js";

await sequelize.sync({ force: true });

