import axios from "axios";
import { config } from "dotenv";
import { QueueForm, IQueue } from "../types";
config({ path: `./.env` });

const api = axios.create({
  baseURL: String(process.env.API_LINK),
});

export const fetchQueues = ({
  chat_id,
  limit,
  page,
}: {
  chat_id: number;
  limit?: number;
  page?: number;
}): Promise<Array<IQueue>> => {
  return api
    .get(`/${chat_id}`, {
      params: {
        limit,
        page,
      },
    })
    .then((res) => res.data);
};

export const fetchQueue = (queue_id: number): Promise<IQueue> => {
  return api.get(`/queue/${queue_id}`).then((res) => res.data);
};

export const createQueue = ({
  user_id,
  queueForm,
  chat_id,
  username,
}: {
  queueForm: QueueForm;
  user_id: number;
  username: string;
  chat_id: number;
}): Promise<IQueue> => {
  const { name: queue_name, numberOfStudents: students_number } = queueForm;
  let data: Partial<any> = {
    queue_name,
    students_number,
    user_id,
    username,
    chat_id,
  };
  if (!students_number) delete data.students_number;
  return api.post(``, data).then((res) => res.data);
};

export const enqueueUser = ({
  user_id,
  username,
  queue_id,
  turn,
  telegram_tag,
}: {
  user_id: number;
  username: string;
  queue_id: number;
  turn: number;
  telegram_tag: string;
}): Promise<IQueue> => {
  return api
    .post(`enqueue`, {
      user_id,
      username,
      queue_id,
      turn,
      telegram_tag,
    })
    .then((res) => res.data);
};

export const dequeueUser = ({
  user_id,
  queue_id,
}: {
  user_id: number;
  queue_id: number;
}) => {
  return api
    .post(`dequeue`, {
      user_id,
      queue_id,
    })
    .then((res) => res.data);
};

export const removeQueue = ({
  queue_id,
  user_id,
}: {
  queue_id: number;
  user_id: number;
}) => {
  return api.delete(``, {
    data: {
      queue_id,
      user_id,
    },
  });
};
