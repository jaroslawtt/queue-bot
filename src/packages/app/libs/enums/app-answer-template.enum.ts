import { MAX_QUEUE_PARTICIPATES_NUMBER } from '~/packages/queues/queues.js';

const AppAnswerTemplateEnum = {
  REQUEST_QUEUE_NAME: 'Send a name for your queue',
  REQUEST_STUDENT_NUMBER: 'Send number of students',
  NOT_A_NUMBER: "You didn't provide a number",
  NEGATIVE_VALUE: "Number of students can't be lower or equal to 0",
  NUMBER_IS_HIGHER_THAN_MAX: `Provided number can't be higher than ${MAX_QUEUE_PARTICIPATES_NUMBER}`,
} as const;

export { AppAnswerTemplateEnum };
