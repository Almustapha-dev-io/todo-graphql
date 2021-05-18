
import { Router } from 'express';

import { localAuth, googleAuthCallback, googleAuth, fbAuth, fbAuthcallback } from '../controllers/auth.controller';

const router = Router();

router.post('/local', localAuth);

router.get('/google', googleAuth);

router.get('/google/callback', googleAuthCallback);

router.get('/facebook', fbAuth);

router.get('/facebook/callback', fbAuthcallback);

export default router;  