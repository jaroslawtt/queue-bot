import { Module } from "@nestjs/common";
import { QueueController } from "./queue.controller";
import { QueueService } from "./queue.service";
import { PrismaService } from "../prisma.service";

@Module({
  controllers: [QueueController],
  providers: [QueueService, PrismaService],
})
export class QueueModule {}
