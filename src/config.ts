import dotenv from "dotenv";

dotenv.config();

const config = {
  store: process.env.RECHARGE_STORE,
  theme_id: process.env.RECHARGE_THEME_ID,
  session: process.env.RECHARGE_SESSION,
};

export default config;
