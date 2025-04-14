import dotenv from "dotenv";

dotenv.config();

const config = {
  store: process.env.RECHARGE_STORE,
  theme_id: process.env.RECHARGE_THEME_ID,
  customer_id: process.env.RECHARGE_CUSTOMER_ID,
  email: process.env.RECHARGE_EMAIL,
  password: process.env.RECHARGE_PASSWORD,
  cwd: process.env.INIT_CWD || process.cwd(),
};

export default config;
