import { config } from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import AnswerTemplates, {AlertTemplates, getQueueList} from "./src/answer-templates/templates";
import {QueueForm, IQueue, CallbackQueryType, ICallbackQuery} from "./types";
import InlineKeyboardButton = TelegramBot.InlineKeyboardButton;
import { getInlineKeyboard } from "./src/inline_keyboard";
import {createQueue, dequeueUser, enqueueUser} from "./src/api";
import {AxiosError} from "axios";

config({path: `.env`});

let tableQueue: { [key: number] : string};


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

bot.onText(/\/create/, async msg => {
    const { chat } = msg;
    await bot.sendMessage(chat.id, `Type your queue's name`);
});


//active queues
bot.onText(/\/active/, async msg => {

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
            const inlineKeyboard: Array<Array<InlineKeyboardButton>> = getInlineKeyboard(newQueue);
            await bot.sendMessage(msg.chat.id, `${getQueueList(newQueue)}`, {
                reply_markup: {
                    inline_keyboard: inlineKeyboard,
                    resize_keyboard: true,
                }
            });
        }
        catch (e) {
           await bot.sendMessage(msg.chat.id, JSON.stringify(e))
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
        console.log(msg?.data?.split("/"))
        if (type) {
            let queue: IQueue;
            switch (type) {
                case `turn`:
                    try {
                        queue = await enqueueUser(msg.from.id, username, queue_id, turn);
                        await bot.editMessageText(getQueueList(queue), {
                            reply_markup: {
                                inline_keyboard: getInlineKeyboard(queue),
                            },
                            message_id,
                            chat_id,
                        })
                    }
                    catch (e: any) {
                        if(e.response?.status === 403) await bot.answerCallbackQuery(msg.id, {
                            text: e.response?.data?.message || AlertTemplates.InQueue, show_alert: true,
                        })
                    }
                    break;
                case `cancel`:
                    try {
                        queue = await dequeueUser(msg.from.id, queue_id);
                        await bot.editMessageText(getQueueList(queue), {
                            reply_markup: {
                                inline_keyboard: getInlineKeyboard(queue),
                            },
                            message_id,
                            chat_id,
                        })
                    }
                    catch (e: any) {
                        if(e.response?.status === 403) await bot.answerCallbackQuery(msg.id, {
                            text: e.response?.data?.message || AlertTemplates.OutQueue, show_alert: true,
                        })
                    }
                    break;

            }
        }
    }
});


