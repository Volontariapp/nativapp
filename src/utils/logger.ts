import { Logger } from "@volontariapp/logger";
import { config } from "../config/base-config";

export const logger = new Logger({
  context: "MOBILE",
  format: config.getLoggerFormat(),
});
