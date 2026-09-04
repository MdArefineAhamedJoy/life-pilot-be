import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
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
  providers: [{ provide: APP_GUARD, useExisting: AuthGuard }],
})
export class AppModule {}
