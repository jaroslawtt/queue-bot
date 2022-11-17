import { config } from "dotenv";
import TelegramBot from "node-telegram-bot-api";

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

bot.onText(/\/start/, async (msg) => {
    await bot.sendMessage(msg.chat.id, `Hello`);
});