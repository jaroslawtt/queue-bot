import { config } from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import AnswerTemplates from "./src/answer-templates/templates";
import { Queue } from "./types";
import InlineKeyboardButton = TelegramBot.InlineKeyboardButton;
import { getInlineKeyboard } from "./src/inline_keyboard";

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

const queue: Queue = {
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
       if(isNaN(parseInt(text)) && !queue.name) queue.name = text;
       else queue.numberOfStudents = parseInt(text);
    }
    if(queue.name && queue.numberOfStudents){
        const inlineKeyboard: Array<Array<InlineKeyboardButton>> = await getInlineKeyboard(queue.numberOfStudents);
        await bot.sendMessage(msg.chat.id, `${queue.numberOfStudents}`, {
            reply_markup: {
                inline_keyboard: inlineKeyboard,
                resize_keyboard: true,
            }
        });
    }
});


//handling choosing turn in query and cancel turn

bot.on(`callback_query`, async msg => {
    const message_id  = msg?.message?.message_id;
   /* if(msg.data && msg.data.search(/turn\//) !== -1 && message_id){

    }*/
});


