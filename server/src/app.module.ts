import { Module } from '@nestjs/common';
import { QueueModule } from './queue/queue.module';
import { AppController } from './app/app.controller';

@Module({
  imports: [ QueueModule ],
  controllers: [AppController],
})
export class AppModule {}
