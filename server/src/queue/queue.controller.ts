import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { QueueService } from "./queue.service";
import {
  UserEnqueueDto,
  UserDequeueDto,
  QueueRemoveDto,
  QueueCreateDto,
} from "../../entities";
import {
  CreateQueueGuard,
  DequeueUserGuard,
  IsQueueExistGuard,
  RemoveQueueGuard,
  EnqueueUserGuard,
} from "./guards";

@Controller("queues")
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get(`/:chatId`)
  getAllQueues(
    @Param(`chatId`) id,
    @Query(`page`) page: string,
    @Query(`limit`) limit: string,
  ) {
    return this.queueService.getQueues(id, parseInt(limit), parseInt(page));
  }

  @Get(`/queue/:id`)
  getQueue(@Param(`id`, ParseIntPipe) id: number) {
    return this.queueService.getQueue(id);
  }

  @Post(``)
  @UseGuards(CreateQueueGuard)
  createQueue(@Body() body: QueueCreateDto) {
    return this.queueService.createQueue(body);
  }

  @Post(`/enqueue`)
  @UseGuards(IsQueueExistGuard, EnqueueUserGuard)
  enqueueUser(@Body() body: UserEnqueueDto) {
    return this.queueService.enqueueUser(body);
  }

  @Post(`/dequeue`)
  @UseGuards(IsQueueExistGuard, DequeueUserGuard)
  dequeueUser(@Body() body: UserDequeueDto) {
    return this.queueService.dequeueUser(body);
  }

  @Delete()
  @HttpCode(201)
  @UseGuards(RemoveQueueGuard)
  removeQueue(@Body() body: QueueRemoveDto) {
    return this.queueService.removeQueue(body);
  }
}
