"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueuesInlineKeyboard = exports.getTurnsInlineKeyboard = void 0;
const cancelButton = { text: `cancel`, callback_data: `` };
const getTurnsInlineKeyboard = (queue) => {
    const inlineKeyboard = [];
    const turns = queue.users.map(student => student.turn);
    let buttons = [];
    for (let i = 1; i <= queue.students_number; i++) {
        if (!turns.includes(i))
            buttons.push({ text: `${i}`, callback_data: `turn/${i}/${queue.queue_id}` });
        if (buttons.length === 3 || i === queue.students_number) {
            inlineKeyboard.push([...buttons]);
            buttons.splice(0, buttons.length);
        }
    }
    inlineKeyboard.push([{ ...cancelButton, callback_data: `cancel//${queue.queue_id}` }]);
    return inlineKeyboard;
};
exports.getTurnsInlineKeyboard = getTurnsInlineKeyboard;
const getQueuesInlineKeyboard = (queues, callback_data) => {
    const inlineKeyboard = [];
    const button = [];
    for (const queue of queues) {
        button.push({ text: queue.queue_name, callback_data: `${callback_data}//${queue.queue_id}` });
        inlineKeyboard.push([...button]);
        button.splice(0, button.length);
    }
    return inlineKeyboard;
};
exports.getQueuesInlineKeyboard = getQueuesInlineKeyboard;
