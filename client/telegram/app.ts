import { config } from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import AnswerTemplates from "./answer-templates/templates";
import { Queue } from "./types";

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
        const inlineKeyboard = [];
        for(let i = 1; i <= queue.numberOfStudents; i++){
            inlineKeyboard.push([{text: `${i}`, callback_data: `${i}`}]);
        }
        await bot.sendMessage(msg.chat.id, `${queue.numberOfStudents}`, {
            reply_markup: {
                inline_keyboard: inlineKeyboard,
                resize_keyboard: true,
            }
        });
    }
});


//handling choosing turn in query

bot.on(`callback_query`, async msg => {
    console.log(msg.data);
})


