/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-console */
/* eslint-disable no-async-promise-executor */
import amqp from 'amqplib';
import 'dotenv/config';

const CONN_URL = process.env.CLOUD_AMQP_URL;

export const publishToQueue = async (queueName, data) => {
  let connection;
  let channel;
  try {
    connection = await amqp.connect(CONN_URL, 'heartbeat=60');
    channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: true });
    await channel.sendToQueue(queueName, Buffer.from(data), { persistent: true });
    console.log('Successfully sent to Queue');

    setTimeout(() => {
      channel.close();
      connection.close();
    }, 500);

    return true;
  } catch (error) {
    if (channel) channel.close();
    if (connection) connection.close();
    console.log(error);
    return false;
  }
};

export const recieveFromQueue = (queueName) => new Promise(async (resolve, reject) => {
  let connection;
  let channel;
  try {
    connection = await amqp.connect(CONN_URL, 'heartbeat=60');
    channel = await connection.createChannel();

    const { messageCount } = await channel.assertQueue(queueName, { durable: true });

    const timeout = 4000;

    if (messageCount > 0) {
      await channel.consume(queueName, (msg) => {
        setTimeout(() => {
          console.log(msg.content.toString());
          channel.ack(msg);
          channel.cancel('myconsumer');
          resolve(true);
        }, timeout);
      }, { consumerTag: 'myconsumer', noAck: false });
    } else {
      console.log('No messages in the Queue');
      resolve(true);
    }
  } catch (error) {
    if (channel) channel.close();
    if (connection) connection.close();
    console.log(error);
    reject(false);
  }
});
