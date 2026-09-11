import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { CurrentUser } from "../auth/auth-user.decorator";
import type { AuthUserResponse } from "../auth/auth.types";
import type { RoutineStatus, RoutineTask } from "./tasks.types";
import { getPagination, paginate } from "../shared/api-response";

@Controller("life-os/tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthUserResponse,
    @Query("page") pageQuery?: string,
    @Query("limit") limitQuery?: string
  ) {
    const tasks = await this.tasksService.findAll(user.id);
    return paginate(tasks, getPagination(pageQuery, limitQuery));
  }

  @Post()
  create(@CurrentUser() user: AuthUserResponse, @Body() payload: Omit<RoutineTask, "id">) {
    return this.tasksService.create(user.id, payload);
  }

  @Patch("reorder")
  reorder(
    @CurrentUser() user: AuthUserResponse,
    @Body("orderedTaskIds") orderedTaskIds: string[] = []
  ) {
    return this.tasksService.reorder(user.id, orderedTaskIds);
  }

  @Patch(":taskId")
  update(
    @CurrentUser() user: AuthUserResponse,
    @Param("taskId") taskId: string,
    @Body() payload: Partial<RoutineTask>
  ) {
    return this.tasksService.update(user.id, taskId, payload);
  }

  @Patch(":taskId/status")
  updateStatus(
    @CurrentUser() user: AuthUserResponse,
    @Param("taskId") taskId: string,
    @Body("status") status: RoutineStatus
  ) {
    return this.tasksService.updateStatus(user.id, taskId, status);
  }

  @Delete(":taskId")
  remove(@CurrentUser() user: AuthUserResponse, @Param("taskId") taskId: string) {
    return this.tasksService.remove(user.id, taskId);
  }
}
