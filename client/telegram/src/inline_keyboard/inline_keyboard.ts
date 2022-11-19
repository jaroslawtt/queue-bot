import TelegramBot from "node-telegram-bot-api";
import InlineKeyboardButton = TelegramBot.InlineKeyboardButton;
import {cancelButton} from "../constants/constants";


export const getInlineKeyboard = async (students: number): Promise<Array<Array<InlineKeyboardButton>>> => {
    const inlineKeyboard: Array<Array<InlineKeyboardButton>> = [];
    let buttons: Array<InlineKeyboardButton> = [];
    for(let i = 1; i <= students; i++){
        buttons.push({text:`${i}`, callback_data: `turn/${i}`});
        if(buttons.length === 3 || i === students){
            inlineKeyboard.push([...buttons]);
            buttons.splice(0,buttons.length);
        }
    }
    inlineKeyboard.push([{...cancelButton, callback_data: `cancel`}]);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(inlineKeyboard);
        }, 0)
    });
};


export const updateInlineKeyboard = () => {

}