import { Router } from 'express';
import { login, perfil } from '../controllers/authController';
import { autenticar } from '../middlewares/autenticar';

const rotas = Router();
rotas.post('/login', login);
rotas.get('/me', autenticar, perfil);
export default rotas;
