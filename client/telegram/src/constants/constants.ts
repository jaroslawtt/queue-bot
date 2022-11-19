import TelegramBot from "node-telegram-bot-api";
import InlineKeyboardButton = TelegramBot.InlineKeyboardButton;


export const cancelButton: InlineKeyboardButton = {text: `Cancel`, callback_data: ``};