import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post } from '@nestjs/common';
import { QueueService } from "./queue.service";
import {UserEnqueueDto, QueueCreateDto, UserDequeueDto, QueueRemoveDto} from "../../entities";

@Controller('queues')
export class QueueController {

    constructor(private readonly queueService: QueueService) {
    }

    @Get(``)
    getAllQueues(){
        return this.queueService.getAllQueues();
    }

    @Get(`/:id`)
    getQueue(@Param(`id`, ParseIntPipe) id: number){
        return this.queueService.getQueue(id);
    }

    @Post(``)
    createQueue(@Body() body: QueueCreateDto){
        return this.queueService.createQueue(body);
    }

    @Post(`/enqueue`)
    @HttpCode(201)
    enqueueUser(@Body() body: UserEnqueueDto){
        return this.queueService.enqueueUser(body);
    }

    @Post(`/dequeue`)
    @HttpCode(201)
    dequeueUser(@Body() body: UserDequeueDto){
        return this.queueService.dequeueUser(body);
    }

    @Delete()
    @HttpCode(201)
    removeQueue(@Body() body: QueueRemoveDto){
        return this.queueService.removeQueue(body);
    }
}
