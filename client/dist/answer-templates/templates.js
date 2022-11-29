"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueueStatsList = exports.getQueueTurnsList = void 0;
const getQueueTurnsList = (queue) => {
    let queueTurnsList = `Queue name: ${queue.queue_name}
Turns: ${queue.students_number}`;
    for (let i = 1; i <= queue.students_number; i++) {
        let username = ``;
        queue.users.forEach(userProfile => {
            if (userProfile.turn === i)
                username += userProfile.user.username;
        });
        queueTurnsList += `\n ${i}. ${username}`;
    }
    return queueTurnsList;
};
exports.getQueueTurnsList = getQueueTurnsList;
const getQueueStatsList = (queues) => {
    let queuesList = `Active queues: ${queues.length}`;
    for (let i = 0; i <= queues.length; i++) {
        if (queues[i]) {
            let usersInQueue = 0;
            queues[i].users.forEach(() => {
                usersInQueue += 1;
            });
            queuesList += `\n ${i + 1}. ${queues[i].queue_name} ${usersInQueue}/${queues[i].students_number}`;
        }
    }
    return queuesList;
};
exports.getQueueStatsList = getQueueStatsList;
