const amqp = require('amqplib');
const logger = require('./logger');

let connection = null;
let channel = null;

const connectRabbitMQ = async () => {
  try {
    const rabbitMqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
    connection = await amqp.connect(rabbitMqUrl);
    channel = await connection.createChannel();
    logger.info('RabbitMQ connection established successfully');
  } catch (error) {
    logger.error('RabbitMQ connection failed:', error);
    // Depending on the architecture, you might not want to crash the whole app if MQ fails,
    // but rather retry connection or just log it.
  }
};

const getChannel = () => {
  if (!channel) {
    logger.warn('RabbitMQ channel is not initialized yet');
  }
  return channel;
};

const closeRabbitMQ = async () => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    logger.info('RabbitMQ connection closed');
  } catch (error) {
    logger.error('Error closing RabbitMQ connection:', error);
  }
};

module.exports = {
  connectRabbitMQ,
  getChannel,
  closeRabbitMQ
};
