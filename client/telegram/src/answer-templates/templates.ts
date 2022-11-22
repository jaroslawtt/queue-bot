import { IQueue } from "../../types";


const enum AnswerTemplates {
    Greetings =
`Привіт!
Я допоможу тобі створити чергу.
Розпочни командою`,
}

export const enum AlertTemplates {
    InQueue = `You are already in the queue`,
    OutQueue = `You are not in the queue`
}

export const getQueueList = (queue: IQueue) => {
    let queueList = `${queue.queue_name}/${queue.students_number}`;
    for(let i = 1; i <= queue.students_number; i++){
        let username: string = ``;
        queue.users.forEach(userProfile => {
            if(userProfile.turn === i) username += userProfile.user.username;
        })
        queueList += `\n ${i}. ${username}`;
    }
    return queueList;
}


export default AnswerTemplates;