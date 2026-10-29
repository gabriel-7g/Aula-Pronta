import 'dotenv/config';

const jwtSecret = process.env.JWT_SECRET || '';

if (
  jwtSecret.length < 32 ||
  jwtSecret.startsWith('COLE_AQUI')
) {
  throw new Error(
    'Configure JWT_SECRET no arquivo backend/.env'
  );
}

export const config = {
  port: Number(process.env.PORT || 3000),
  frontendUrl:
    process.env.FRONTEND_URL || 'http://localhost:8100',
  jwtSecret
};