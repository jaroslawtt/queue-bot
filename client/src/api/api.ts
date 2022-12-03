import axios from "axios";
import { QueueForm, IQueue } from "../types";


const api = axios.create({
    baseURL: `http://localhost:3333/queues` || process.env.API_LINK,
});


export const fetchQueues = (chat_id: number, limit?: number, page?: number): Promise<Array<IQueue>> => {
    return api.get(`/${chat_id}`, {
        params: {
            limit,
            page,
        }
    }).then(res => res.data);
};




export const fetchQueue =  (queue_id: number): Promise<IQueue> => {
    return api.get(`/queue/${queue_id}`)
        .then(res => res.data);
}

export const createQueue = (queueForm: QueueForm, user_id: number, username: string, chat_id: number): Promise<IQueue> => {
    const { name: queue_name, numberOfStudents: students_number } = queueForm;
    let data: Partial<any> = {
        queue_name,
        students_number,
        user_id,
        username,
        chat_id,
    }
    if(!students_number) delete data.students_number;
    return api.post(``, data)
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

