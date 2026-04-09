import { FrontendConfig } from '@volontariapp/config';
import { IsDefined, IsNotEmpty } from 'class-validator';

export class AppConfig extends FrontendConfig {
  @IsDefined()
  @IsNotEmpty()
  declare apiGatewayUrl: string;
}
