import { Module } from "@nestjs/common";
import { LifeOsStateController } from "./life-os-state.controller";
import { LifeOsStateService } from "./life-os-state.service";

@Module({
  controllers: [LifeOsStateController],
  providers: [LifeOsStateService],
  exports: [LifeOsStateService],
})
export class LifeOsStateModule {}
