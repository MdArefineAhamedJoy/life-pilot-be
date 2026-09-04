import { Module } from "@nestjs/common";
import { TimerSessionsController } from "./timer-sessions.controller";
import { TimerSessionsService } from "./timer-sessions.service";

@Module({
  controllers: [TimerSessionsController],
  providers: [TimerSessionsService],
})
export class TimerSessionsModule {}
