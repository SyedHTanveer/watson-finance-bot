import { Router } from 'express';

const router = Router();
router.get('/', (req, res) => {
  res.redirect('https://google.com/');
});


export default router;
