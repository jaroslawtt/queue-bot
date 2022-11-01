import TelegramBot from "node-telegram-bot-api";
import { config } from "dotenv";

config({
    path: './vars/.env'
});

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, {
    polling:{
        interval:300,
        autoStart: true,
        params:{
            timeout:10,
        }
    }
});
