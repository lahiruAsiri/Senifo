import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { loginRateLimit } from '../../middleware/rateLimit';
import { loginSchema } from '../../../../shared/schemas/auth.schema';

const router = Router();

router.post('/login', loginRateLimit, validateBody(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
