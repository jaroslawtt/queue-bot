import { IQueue } from "../types";


const enum AnswerTemplates {
    Greetings =
`What's up✋.
I can help you with creating queues🧑‍🤝‍🧑.
Start with /create`,
    QueueExist = `Queue with this name already exists`,
    NotANumber = `You didn't provide a number`,
}

export const enum AlertTemplates {
    TakenTurn = `This turn has been taken already`,
    InQueue = `You are already in the queue`,
    OutQueue = `You are not in the queue`,
    QueueNotExist = `This queue doesn't exist anymore`,
    DefaultAlert = `Oops, sth went wrong...`,
}

export const getQueueTurnsList = (queue: IQueue) => {
    let queueTurnsList = `Queue name: ${queue.queue_name}
Turns: ${queue.students_number}`;
    for(let i = 1; i <= queue.students_number; i++){
        let username: string = ``;
        queue.users.forEach(userProfile => {
            if(userProfile.turn === i) username += userProfile.user.username;
        })
        queueTurnsList += `\n ${i}. ${username}`;
    }
    return queueTurnsList;
}

export const getQueueStatsList = (queues: Array<IQueue>) => {
    let queuesList = `Active queues: ${queues.length}`;
    for(let i = 0; i<= queues.length; i++){
        if(queues[i]){
            let usersInQueue: number = 0;
            queues[i].users.forEach(() => {
                usersInQueue += 1;
            });
            queuesList += `\n ${i + 1}. ${queues[i].queue_name} ${usersInQueue}/${queues[i].students_number}`
        }
    }
    return queuesList;
}

export default AnswerTemplates;