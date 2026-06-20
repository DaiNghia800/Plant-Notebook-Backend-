const { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');

// Khởi tạo SQS Client
const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const QUEUE_URL = process.env.AWS_SQS_QUEUE_URL;

/**
 * Gửi message vào SQS
 * @param {Object} messageBody Dữ liệu JSON cần gửi
 */
const sendMessage = async (messageBody) => {
  if (!QUEUE_URL) {
    throw new Error('AWS_SQS_QUEUE_URL is not defined in environment variables');
  }

  const params = {
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify(messageBody),
  };

  try {
    const data = await sqsClient.send(new SendMessageCommand(params));
    console.log('[SQS] Message sent:', data.MessageId);
    return data;
  } catch (error) {
    console.error('[SQS] Error sending message:', error);
    throw error;
  }
};

/**
 * Lấy message từ SQS
 */
const receiveMessages = async () => {
  if (!QUEUE_URL) {
    throw new Error('AWS_SQS_QUEUE_URL is not defined in environment variables');
  }

  const params = {
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20, // Long polling
  };

  try {
    const data = await sqsClient.send(new ReceiveMessageCommand(params));
    return data.Messages || [];
  } catch (error) {
    console.error('[SQS] Error receiving messages:', error);
    throw error;
  }
};

/**
 * Xóa message khỏi SQS sau khi xử lý xong
 * @param {String} receiptHandle 
 */
const deleteMessage = async (receiptHandle) => {
  if (!QUEUE_URL) {
    throw new Error('AWS_SQS_QUEUE_URL is not defined in environment variables');
  }

  const params = {
    QueueUrl: QUEUE_URL,
    ReceiptHandle: receiptHandle,
  };

  try {
    await sqsClient.send(new DeleteMessageCommand(params));
    console.log('[SQS] Message deleted:', receiptHandle.substring(0, 10) + '...');
  } catch (error) {
    console.error('[SQS] Error deleting message:', error);
    throw error;
  }
};

module.exports = {
  sendMessage,
  receiveMessages,
  deleteMessage,
};
