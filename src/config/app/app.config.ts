import { registerAs } from '@nestjs/config';
import { ParseEnvOrigins } from 'src/shared/utils/parse-env-origins';

export const APP_CONFIG = 'app';
//Ham lay danh sach Origin da qua xu ly
export default registerAs(APP_CONFIG, () => ({
  port: parseInt(process.env.PORT ?? '8080'),
  corsOrigin: ParseEnvOrigins(
    process.env.CLIENT_URL,
    process.env.CORS_OTHER_URL,
  ),
}));
