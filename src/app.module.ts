import { Module } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { ConfigModule } from "@nestjs/config";
import { AccountsModule } from "./accounts/accounts.module";
import { AuthModule } from "./auth/auth.module";
import { AuthGuard } from "./auth/auth.guard";
import { CategoriesModule } from "./categories/categories.module";
import { DatabaseModule } from "./db/database.module";
import { ExpensesModule } from "./expenses/expenses.module";
import { HealthModule } from "./health/health.module";
import { LifeOsStateModule } from "./life-os-state/life-os-state.module";
import { NotesModule } from "./notes/notes.module";
import { SettingsModule } from "./settings/settings.module";
import { TasksModule } from "./tasks/tasks.module";
import { TimerSessionsModule } from "./timer-sessions/timer-sessions.module";
import { ApiExceptionFilter } from "./shared/api-exception.filter";
import { ApiResponseInterceptor } from "./shared/api-response.interceptor";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    DatabaseModule,
    HealthModule,
    AuthModule,
    AccountsModule,
    LifeOsStateModule,
    CategoriesModule,
    ExpensesModule,
    TasksModule,
    TimerSessionsModule,
    NotesModule,
    SettingsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useExisting: AuthGuard },
    { provide: APP_INTERCEPTOR, useClass: ApiResponseInterceptor },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
})
export class AppModule {}
