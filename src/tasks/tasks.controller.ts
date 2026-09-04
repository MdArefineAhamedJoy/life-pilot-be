import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import type { RoutineStatus, RoutineTask } from "./tasks.types";

@Controller("life-os/tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Post()
  create(@Body() payload: Omit<RoutineTask, "id">) {
    return this.tasksService.create(payload);
  }

  @Patch("reorder")
  reorder(@Body("orderedTaskIds") orderedTaskIds: string[] = []) {
    return this.tasksService.reorder(orderedTaskIds);
  }

  @Patch(":taskId")
  update(@Param("taskId") taskId: string, @Body() payload: Partial<RoutineTask>) {
    return this.tasksService.update(taskId, payload);
  }

  @Patch(":taskId/status")
  updateStatus(@Param("taskId") taskId: string, @Body("status") status: RoutineStatus) {
    return this.tasksService.updateStatus(taskId, status);
  }

  @Delete(":taskId")
  remove(@Param("taskId") taskId: string) {
    return this.tasksService.remove(taskId);
  }
}
