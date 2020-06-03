import { Router } from 'express';
import * as Watson from './controller/watson_controller';

const router = Router();

router.post('/', Watson.handleQuestion);
router.post('/', Watson.handleDiscovery);

export default router;
