import type {
  FrontendConfig,
  LoggerConfig,
  LoggerFormat,
  NodeEnv,
} from "@volontariapp/config";
import { IsDefined, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class AppConfig implements FrontendConfig {
  @IsDefined()
  @IsNotEmpty()
  apiGatewayUrl: string = undefined as unknown as string;

  @IsDefined()
  @IsString()
  nodeEnv: NodeEnv = undefined as unknown as NodeEnv;

  @IsDefined()
  @IsNumber()
  port: number = undefined as unknown as number;

  @IsDefined()
  @IsNotEmpty()
  logger: LoggerConfig = undefined as unknown as LoggerConfig;

  getLoggerFormat(): LoggerFormat {
    return this.logger.format;
  }
}
export type AppEnv = "local" | "development" | "production" | "test";
