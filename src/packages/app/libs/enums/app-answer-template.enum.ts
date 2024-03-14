import { MAX_QUEUE_PARTICIPATES_NUMBER } from '~/packages/queues/queues.js';

const AppAnswerTemplateEnum = {
  REQUEST_QUEUE_NAME: 'Send a name for your queue.',
  REQUEST_PARTICIPANTS_NUMBER: 'Send number of participants.',
  NOT_A_NUMBER: "You didn't provide a number.",
  NEGATIVE_VALUE: "Number of students can't be lower or equal to 0",
  NUMBER_IS_HIGHER_THAN_MAX: `Provided number can't be higher than ${MAX_QUEUE_PARTICIPATES_NUMBER}.`,
  USER_DOES_NOT_GET_NOTIFICATIONS: `You don't get notifications already. \nYou can easily resume your subscription using the /resume command.`,
  GETTING_NOTIFICATIONS_CANCELED: `Getting notifications are now stopped. \nYou can easily resume your subscription using the /resume command.`,
  USER_ALREADY_GET_NOTIFICATIONS: `You get notifications already. \nYou can easily stop your subscription using the /stop command.`,
  GETTING_NOTIFICATIONS_ALLOWED: `Getting notifications are now started. \nYou can easily stop your subscription using the /stop command.`,
  NO_PERMISSION_TO_MANIPULATE_WITH: `You are not permitted to manipulate the buttons`,
  QUEUE_NOT_EXIST: 'Queue does not exist anymore',
  NO_RIGHTS: 'You do not have enough rights for this operation',
  CHAT_START:
    'Hey there! 👋 I’m here to assist you with creating queues. To get started, simply type /create',
  PRIVATE_START:
    'Hey there! 👋 I’m here to assist you with receiving notifications when queues are created. To stop receiving notifications, simply type /stop.” 🚀\n',
} as const;

export { AppAnswerTemplateEnum };
