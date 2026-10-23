import 'dotenv/config';

const exigidas = ['DATABASE_URL', 'JWT_SECRET'] as const;
for (const chave of exigidas) {
  const valor = process.env[chave];
  if (!valor || valor.startsWith('COLE_AQUI') || valor.includes('SUA_SENHA_POSTGRES')) {
    throw new Error(`Configure ${chave} no arquivo backend/.env antes de iniciar.`);
  }
}
if ((process.env.JWT_SECRET || '').length < 32) {
  throw new Error('JWT_SECRET precisa ter pelo menos 32 caracteres.');
}

export const config = {
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8100'
};
if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
  throw new Error('PORT deve ser um número entre 1 e 65535.');
}
