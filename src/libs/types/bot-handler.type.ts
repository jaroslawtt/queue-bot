import TelegramBot from 'node-telegram-bot-api';

type BotHandler = (bot: TelegramBot) => void;

export { BotHandler };
