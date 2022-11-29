"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeQueue = exports.dequeueUser = exports.enqueueUser = exports.createQueue = exports.fetchQueue = exports.fetchQueues = void 0;
const axios_1 = __importDefault(require("axios"));
const api = axios_1.default.create({
    baseURL: `https://queue-7m29dfsja-jaroslawtt.vercel.app/queues`,
});
const fetchQueues = (chat_id) => {
    return api.get(`/${chat_id}`, {}).then(res => res.data);
};
exports.fetchQueues = fetchQueues;
const fetchQueue = (queue_id) => {
    return api.get(`/queue/${queue_id}`)
        .then(res => res.data);
};
exports.fetchQueue = fetchQueue;
const createQueue = (queueForm, user_id, username, chat_id) => {
    return api.post(``, {
        queue_name: queueForm.name,
        students_number: queueForm.numberOfStudents,
        user_id,
        username,
        chat_id,
    })
        .then(res => res.data);
};
exports.createQueue = createQueue;
const enqueueUser = (user_id, username, queue_id, turn) => {
    return api.post(`enqueue`, {
        user_id,
        username,
        queue_id,
        turn
    }).then(res => res.data);
};
exports.enqueueUser = enqueueUser;
const dequeueUser = (user_id, queue_id) => {
    return api.post(`dequeue`, {
        user_id,
        queue_id
    }).then(res => res.data);
};
exports.dequeueUser = dequeueUser;
const removeQueue = (queue_id, user_id) => {
    return api.delete(``, {
        data: {
            queue_id,
            user_id,
        }
    });
};
exports.removeQueue = removeQueue;
