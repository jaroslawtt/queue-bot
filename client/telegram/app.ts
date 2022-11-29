import { config } from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import AnswerTemplates, { AlertTemplates, getQueueStatsList, getQueueTurnsList } from "./src/answer-templates/templates";
import { QueueForm, IQueue, AxiosErrorMessage } from "./types";
import { getQueuesInlineKeyboard, getTurnsInlineKeyboard } from "./src/inline_keyboard";
import { createQueue, dequeueUser, enqueueUser, fetchQueue, fetchQueues, removeQueue } from "./src/api";
import InlineKeyboardButton = TelegramBot.InlineKeyboardButton;

config({ path: `.env` });


const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string,{
    polling:{
        interval:300,
        autoStart: true,
        params:{
            timeout:10,
        }
    },
});

let creatorId: number | null = null;

const queueForm: QueueForm = {
    name: ``,
    numberOfStudents: null,
}


bot.onText(/\/start/, async msg => {
    await bot.sendMessage(msg.chat.id, '', {
        parse_mode: `HTML`,
        disable_notification: true,
    });
});

// call this to create queue
bot.onText(/\/create/, async msg => {
    creatorId = msg?.from?.id || null;
    queueForm.name = ``;
    queueForm.numberOfStudents = null;
    if(creatorId){
      /*  await bot.deleteMessage(msg.chat.id, msg.message_id);*/
        await bot.sendMessage(msg.chat.id, `Send a name for your queue`, {
            reply_to_message_id: msg.message_id,
        });
    }
});


bot.onText(/\/cancel/, async msg => {
    if(msg.from && msg.from?.id === creatorId){
        creatorId = null;
        queueForm.name = ``;
        queueForm.numberOfStudents = null;
    }
});


//call this to see all available queues
bot.onText(/\/queues/, async msg => {
    const chat_id = msg.chat.id;
    try {
        const queues = await fetchQueues(chat_id);
        await bot.sendMessage(chat_id, getQueueStatsList(queues), {
            reply_markup: {
                inline_keyboard: getQueuesInlineKeyboard(queues, `queue`),
            }
        });
    }
    catch (e: any) {
        console.log(e);
    }
});

bot.onText(/\/remove/, async msg => {
    const chat_id = msg.chat.id;
    const queues = await fetchQueues(chat_id);
    await bot.sendMessage(chat_id, getQueueStatsList(queues), {
        reply_markup: {
            inline_keyboard: getQueuesInlineKeyboard(queues, `delete`),
        }
    });
})


//handling
bot.on(`message`, async msg => {
    if(creatorId){
       if(msg.from && msg.from?.id === creatorId && msg.text && !RegExp(/\/+/).test(msg.text)){
           const { text } = msg;
           if(queueForm.name.length === 0){
                queueForm.name = text;
                await bot.sendMessage(msg.chat.id, `Send number of students`, {
                    reply_to_message_id: msg.message_id,
                });
           }
           else if(!queueForm.numberOfStudents && !Number.isNaN(parseInt(text))){
               queueForm.numberOfStudents = parseInt(text);
               const username: string = msg?.from.first_name || ``;
               try {
                   const newQueue: IQueue = await createQueue(queueForm, creatorId, username, msg.chat.id);
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
                       queueForm.name = ``;
                       queueForm.numberOfStudents = null;
                   }
                   else{
                       await bot.sendMessage(msg.chat.id, AlertTemplates.DefaultAlert);
                   }
               }
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
                        await bot.deleteMessage(msg.message.chat.id, msg.message.message_id);
                        await bot.sendMessage(chat_id,`${getQueueTurnsList(queue)}`);
                        break;
                    case `delete`:
                        await removeQueue(queue_id, msg.from.id);
                        await bot.deleteMessage(msg.message.chat.id, msg.message.message_id);
                        break;
                }
            } catch (e: any) {
                console.log(e);
                if (e?.response?.status === 403) {
                    const text: AxiosErrorMessage = e.response?.data?.message;
                    switch (text) {
                        case "This queue doesn't exist anymore":
                            await bot.deleteMessage(chat_id, message_id);
                            await bot.answerCallbackQuery(msg.id, {
                                text, show_alert: true,
                            })
                            break;
                        default:
                            await bot.answerCallbackQuery(msg.id, {
                                text, show_alert: true,
                            })
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


