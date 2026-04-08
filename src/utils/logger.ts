import { Logger } from '@volontariapp/logger';

export const logger = new Logger({
  context: 'MOBILE',
  format: 'text', // Text is better for RN debugging console
});
