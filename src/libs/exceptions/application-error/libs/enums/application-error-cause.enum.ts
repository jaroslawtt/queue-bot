const ApplicationErrorCause = {
  NOT_IN_THE_QUEUE: 'Not in the queue',
  QUEUE_NOT_EXIST: 'Queue does not exist',
  ALREADY_IN_QUEUE: 'Already in the queue',
  TURN_TAKEN: 'Turn is taken',
} as const;

export { ApplicationErrorCause };
