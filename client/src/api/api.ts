import axios from "axios";
import { QueueForm, IQueue } from "../types";


const api = axios.create({
    baseURL: `https://queue-7m29dfsja-jaroslawtt.vercel.app/queues`,
    //baseURL: `http://localhost:3333/queues`
});


export const fetchQueues = (chat_id: number): Promise<Array<IQueue>> => {
    return api.get(`/${chat_id}`, {
    }).then(res => res.data);
}

export const fetchQueue =  (queue_id: number): Promise<IQueue> => {
    return api.get(`/queue/${queue_id}`)
        .then(res => res.data);
}

export const createQueue = (queueForm: QueueForm, user_id: number, username: string, chat_id: number): Promise<IQueue> => {
    return api.post(``, {
        queue_name: queueForm.name,
        students_number: queueForm.numberOfStudents,
        user_id,
        username,
        chat_id,
    })
        .then(res => res.data);
};

export const enqueueUser = (user_id: number, username: string, queue_id: number, turn: number): Promise<IQueue> => {
    return api.post(`enqueue`, {
        user_id,
        username,
        queue_id,
        turn
    }).then(res => res.data);
}

export const dequeueUser = (user_id: number, queue_id: number) => {
        return api.post(`dequeue`, {
            user_id,
            queue_id
        }).then(res => res.data);
}

export const removeQueue = (queue_id: number, user_id: number) => {
    return api.delete(``, {
        data: {
            queue_id,
            user_id,
        }
    })
}

