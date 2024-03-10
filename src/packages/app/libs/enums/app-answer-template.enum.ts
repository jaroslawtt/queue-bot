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
} as const;

export { AppAnswerTemplateEnum };
