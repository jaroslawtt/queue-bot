import { config } from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import AnswerTemplates, { AlertTemplates, getQueueStatsList, getQueueTurnsList } from "./answer-templates/templates";
import { QueueForm, IQueue, CallbackQueryType, AxiosCustomException } from "./types";
import { getQueueControlsInlineKeyboard, getQueuesInlineKeyboard, getTurnsInlineKeyboard } from "./inline_keyboard";
import { createQueue, dequeueUser, enqueueUser, fetchQueue, fetchQueues, removeQueue } from "./api";
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
    await bot.sendMessage(msg.chat.id, AnswerTemplates.Greetings, {
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
        await bot.sendMessage(msg.chat.id, `Send a name for your queue`, {
            reply_to_message_id: msg.message_id,
        });
    }
});


//call to cancel creating queue
bot.onText(/\/cancel/, async msg => {
    const chat_id = msg.chat.id;
    if(msg.from && msg.from?.id === creatorId){
        creatorId = null;
        queueForm.name = ``;
        queueForm.numberOfStudents = null;
        await bot.sendMessage(chat_id,AnswerTemplates.CreationCanceled);
        await bot.deleteMessage(chat_id, msg.message_id);
    }
});


//call this to see all available queues
bot.onText(/\/queues/, async msg => {
    const chat_id = msg.chat.id;
    try {
        const queues = await fetchQueues(chat_id);
        await bot.sendMessage(chat_id, getQueueStatsList(queues), {
            reply_markup: {
                inline_keyboard: getQueuesInlineKeyboard(queues, `control`),
            }
        });
        await bot.deleteMessage(chat_id, msg.message_id);
    }
    catch (e: unknown) {
        await bot.sendMessage(msg.chat.id, AlertTemplates.DefaultAlert);
    }
});


//handling queue data
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
               catch (e: unknown) {
                   const { status } = (e as AxiosCustomException).response;
                   if(status === 403){
                       await bot.sendMessage(msg.chat.id, AnswerTemplates.QueueExist, {
                           reply_to_message_id: msg.message_id,
                       });
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
        const type: CallbackQueryType = msg.data.split("/")[0] as CallbackQueryType;
        const turn: number = parseInt(msg?.data?.split("/")[1]) || 0;
        const queue_id: number = parseInt(msg?.data?.split("/")[2]);
        const username: string = msg?.from.first_name || ``;
        const message_id: number = msg.message.message_id;
        const chat_id: number = msg.message.chat.id;
        if (type) {
            let queue: IQueue;
            try {
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
                    case `control`:
                        await bot.editMessageReplyMarkup({
                            inline_keyboard: getQueueControlsInlineKeyboard(queue_id)
                        }, {
                            message_id,
                            chat_id,
                        });
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
                    case `back`:
                        const queues = await fetchQueues(chat_id);
                        await bot.editMessageText(getQueueStatsList(queues),{
                            reply_markup: {
                                inline_keyboard: getQueuesInlineKeyboard(queues, `control`),
                            },
                            chat_id,
                            message_id,
                        });
                        break;
                }
            } catch (e: unknown) {
                const { status } = (e as AxiosCustomException).response;
                const { message: text } = (e as AxiosCustomException).response.data;
                if (status === 403) {
                    await bot.answerCallbackQuery(msg.id, {
                        text, show_alert: true,
                    });
                    if(text === `This queue doesn't exist anymore`) await bot.deleteMessage(chat_id, message_id);
                }
                else {
                    await bot.answerCallbackQuery(msg.id, {
                        text: AlertTemplates.DefaultAlert, show_alert: true,
                    });
                }
            }
    }
}
});


