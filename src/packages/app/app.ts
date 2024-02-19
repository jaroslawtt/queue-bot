import { AppHandlerManager } from './app.handler-manager.js';
import { queueService } from '~/packages/queues/queues.js';
import { AppService } from '~/packages/app/app.service.js';
import { userService } from '~/packages/users/users.js';

const appService = new AppService(queueService, userService);
const appHandlerManager = new AppHandlerManager(appService);

export { appHandlerManager };
