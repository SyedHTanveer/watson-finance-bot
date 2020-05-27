import { Router } from 'express';
import * as Watson from './controller/watson_controller';

const router = Router();

router.post('/', Watson.handleQuestion);


export default router;
