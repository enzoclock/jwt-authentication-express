import { sequelize } from "./index.js";

await sequelize.dropAllSchemas({ force: true });
await sequelize.sync({ force: true });

