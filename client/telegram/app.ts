import { config } from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import AnswerTemplates, {AlertTemplates, getQueueStatsList, getQueueTurnsList} from "./src/answer-templates/templates";
import {QueueForm, IQueue, AxiosErrorMessage} from "./types";
import InlineKeyboardButton = TelegramBot.InlineKeyboardButton;
import {getQueuesInlineKeyboard, getTurnsInlineKeyboard} from "./src/inline_keyboard";
import {createQueue, dequeueUser, enqueueUser, fetchQueue, fetchQueues} from "./src/api";

config({path: `.env`});


const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string,{
    polling:{
        interval:300,
        autoStart: true,
        params:{
            timeout:10,
        }
    },
});

const queueForm: QueueForm = {
    name: ``,
    numberOfStudents: null,
}

bot.onText(/\/start/, async msg => {
    await bot.sendMessage(msg.chat.id, AnswerTemplates.Greetings);
});

// call this to create queue
bot.onText(/\/create/, async msg => {
    const { chat } = msg;
    await bot.sendMessage(chat.id, `Type your queue's name`);
});


//call this to see all active queues
bot.onText(/\/active/, async msg => {
    const chat_id = msg.chat.id;
    const queues = await fetchQueues();
    await bot.sendMessage(chat_id, getQueueStatsList(queues), {
          reply_markup: {
              inline_keyboard: getQueuesInlineKeyboard(queues),
          }
    });
});

bot.onText(/\/delete/, async msg => {

});

bot.on(`message`, async msg => {
    if(msg.text && msg.text.search(/\/.*/) === -1){
       const { text } = msg;
       if(isNaN(parseInt(text)) && !queueForm.name) queueForm.name = text;
       else queueForm.numberOfStudents = parseInt(text);
    }
    if(queueForm.name && queueForm.numberOfStudents){
        try {
            const newQueue: IQueue = await createQueue(queueForm);
            const inlineKeyboard: Array<Array<InlineKeyboardButton>> = getTurnsInlineKeyboard(newQueue);
            await bot.sendMessage(msg.chat.id, `${getQueueTurnsList(newQueue)}`, {
                reply_markup: {
                    inline_keyboard: inlineKeyboard,
                    resize_keyboard: true,
                }
            });
        }
        catch (e: any) {
           if(e.response.status === 403){
               await bot.sendMessage(msg.chat.id, AnswerTemplates.QueueExist);
               queueForm.numberOfStudents = null;
           }
           else{
               await bot.sendMessage(msg.chat.id, AlertTemplates.DefaultAlert);
           }
        }
    }
});


//handling choosing turn in query and cancel turn

bot.on(`callback_query`, async (msg) => {
    if(msg.data && msg.message) {
        const type: string = msg.data.split("/")[0] || ``;
        const turn: number = parseInt(msg?.data?.split("/")[1]) || 0;
        const queue_id: number = parseInt(msg?.data?.split("/")[2]);
        const username: string = msg?.from.first_name || ``;
        const message_id: number = msg.message.message_id;
        const chat_id: number = msg.message.chat.id;
        if (type) {
            try {
                let queue: IQueue;
                switch (type) {
                    case `turn`:
                        queue = await enqueueUser(msg.from.id, username, queue_id, turn);
                        await bot.editMessageText(getQueueTurnsList(queue), {
                            reply_markup: {
                                inline_keyboard: getTurnsInlineKeyboard(queue),
                            },
                            message_id,
                            chat_id,
                        })
                        break;
                    case `cancel`:
                        queue = await dequeueUser(msg.from.id, queue_id);
                        await bot.editMessageText(getQueueTurnsList(queue), {
                            reply_markup: {
                                inline_keyboard: getTurnsInlineKeyboard(queue),
                            },
                            message_id,
                            chat_id,
                        })
                        break;
                    case `queue`:
                        queue = await fetchQueue(queue_id);
                        await bot.sendMessage(chat_id,`${getQueueTurnsList(queue)}`);
                        break;
                }
            } catch (e: any) {
                if (e?.response?.status === 403) {
                    const message: AxiosErrorMessage = e.response?.data?.message;
                    switch (message) {
                        case `The turn is already taken`:
                            await bot.answerCallbackQuery(msg.id, {
                                text: AlertTemplates.TakenTurn, show_alert: true,
                            });
                            break;
                        case `User is already in queue`:
                            await bot.answerCallbackQuery(msg.id, {
                                text: AlertTemplates.InQueue, show_alert: true,
                            });
                            break;
                        case `User isn't in the queue`:
                            await bot.answerCallbackQuery(msg.id, {
                                text: AlertTemplates.OutQueue, show_alert: true,
                            });
                            break;
                        case "This queue doesn't exist anymore":
                            await bot.answerCallbackQuery(msg.id, {
                                text: AlertTemplates.QueueNotExist, show_alert: true,
                            });
                            await bot.deleteMessage(chat_id, message_id);
                            break;
                        default:
                            await bot.answerCallbackQuery(msg.id, {
                                text: AlertTemplates.DefaultAlert, show_alert: true,
                            });
                    }
                } else {
                    await bot.answerCallbackQuery(msg.id, {
                        text: AlertTemplates.DefaultAlert, show_alert: true,
                    });
                }
            }
    }
}
});


