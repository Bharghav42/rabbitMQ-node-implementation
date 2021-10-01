import { Router } from 'express';
import { publishToQueue, recieveFromQueue } from './MQService';

const router = Router();

router.get('/', (req, res) => {
  res.send('Router Working');
});

router.post('/publishMsg', async (req, res) => {
  const { queueName, payload } = req.body;
  const isPublished = await publishToQueue(queueName, payload);

  if (isPublished) res.status(200).send({ status: 'SUCCESS' });
  else res.status(500).send({ status: 'FAILED' });
});

router.post('/recieveMsg', async (req, res) => {
  const { queueName } = req.body;
  const isRecieved = await recieveFromQueue(queueName);

  if (isRecieved) res.status(200).send({ status: 'SUCCESS' });
  else res.status(500).send({ status: 'FAILED' });
});

export default router;
