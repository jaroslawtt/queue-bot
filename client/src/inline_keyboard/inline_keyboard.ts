import TelegramBot from "../../local_modules/@types/node-telegram-bot-api";
import InlineKeyboardButton = TelegramBot.InlineKeyboardButton;
import { IQueue } from "../types";


const cancelButton: InlineKeyboardButton = { text: `cancel`, callback_data: ``};


export const getTurnsInlineKeyboard = (queue: IQueue): Array<Array<InlineKeyboardButton>> => {
    const inlineKeyboard: Array<Array<InlineKeyboardButton>> = [];
    const turns = queue.users.map(student => student.turn);
    let buttons: Array<InlineKeyboardButton> = [];
    for(let i = 1; i <= queue.students_number; i++){
       if(!turns.includes(i)) buttons.push({text:`${i}`, callback_data: `turn/${i}/${queue.queue_id}`});
        if(buttons.length === 3 || i === queue.students_number){
            inlineKeyboard.push([...buttons]);
            buttons.splice(0,buttons.length);
        }
    }
    inlineKeyboard.push([{...cancelButton, callback_data: `cancel//${queue.queue_id}`}]);
    return inlineKeyboard;
};


export const getQueuesInlineKeyboard = (queues: Array<IQueue>, callback_data: string, page?: number): Array<Array<InlineKeyboardButton>> => {
    const inlineKeyboard: Array<Array<InlineKeyboardButton>> = [];
    const button: Array<InlineKeyboardButton> = [];
    for (const queue of queues) {
        button.push({text: queue.queue_name, callback_data: `${callback_data}/${page}/${queue.queue_id}`});
        inlineKeyboard.push([...button]);
        button.splice(0,button.length);
    }
    return inlineKeyboard;
};

export const getQueueControlsInlineKeyboard = (queue_id: number, page: number) => {
    const buttons: Array<Array<InlineKeyboardButton>> = [
        [{text: `Queue list`, callback_data: `queue//${queue_id}`}, { text: `Delete queue`, callback_data: `delete//${queue_id}`}],
        [{text: `Back`, callback_data: `back/${page}`}]
    ];
    return buttons;
};


export const getPaginationControls = (length: number, limit: number, page: number) => {
    const keys: Array<InlineKeyboardButton> = [];
    if(page === 0){
        if(length === limit) keys.push({ text: `➡`, callback_data: `page/${++page}`});
    }
    else if(length < limit) keys.push({ text: `⬅`, callback_data: `page/${--page}`});
    else keys.push({ text: `⬅`, callback_data: `page/${page - 1}`}, { text: `➡`, callback_data: `page/${page + 1}`})
    return [keys];
};
