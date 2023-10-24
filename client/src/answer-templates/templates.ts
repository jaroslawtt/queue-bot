import { IQueue } from "../types";

const enum AnswerTemplates {
  Greetings = `What's up✋.
I can help you with creating queues🧑‍🤝‍🧑.
Start with /create`,
  QueueExist = `This queue doesn't exist`,
  NotANumber = `You didn't provide a number`,
  NegativeOrZero = `You passed negative or zero value`,
}

export const enum AlertTemplates {
  DefaultAlert = `Oops, sth went wrong...`,
}

export const getQueueTurnsList = (queue: IQueue) => {
  let queueTurnsList = `Queue name: ${queue.queue_name}
Turns: ${queue.students_number}`;
  for (let i = 1; i <= queue.students_number; i++) {
    let username: string = ``;
    let userTag: string = ``;
    queue.users.forEach((userProfile) => {
      if (userProfile.turn === i) {
        username += userProfile.user.username;
        userTag += userProfile.user.telegram_tag;
      }
    });
    queueTurnsList += `\n ${i}. ${
      userTag.length > 0 ? `@${userTag}` : `${username}`
    }`;
  }
  const date = new Date();
  queueTurnsList += `\n Date: ${date.toLocaleDateString()} \n Time: ${date.getHours()}:${date.getUTCMinutes()}:${date.getSeconds()}:${date.getUTCMilliseconds()}`;
  return queueTurnsList;
};

export const getQueueStatsList = (queues: Array<IQueue>) => {
  let queuesList = `Active queues: ${queues.length}`;
  for (let i = 0; i <= queues.length; i++) {
    if (queues[i]) {
      let usersInQueue: number = 0;
      queues[i].users.forEach(() => {
        usersInQueue += 1;
      });
      queuesList += `\n ${i + 1}. ${queues[i].queue_name} ${usersInQueue}/${
        queues[i].students_number
      }`;
    }
  }
  return queuesList;
};

export const getQueueProfileInfo = (queue: IQueue) => {
  return `
Name: ${queue.queue_name}
Turns: ${queue.students_number}
Author: ${queue.host.username}
Created: ${new Date(queue.created_at).toLocaleDateString()}     
    `;
};

export default AnswerTemplates;
