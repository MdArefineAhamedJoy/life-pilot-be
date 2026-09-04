ALTER TABLE "budget_categories" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "routine_tasks" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "timer_sessions" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "life_notes" ADD COLUMN IF NOT EXISTS "user_id" uuid;

CREATE INDEX IF NOT EXISTS "budget_categories_user_id_idx" ON "budget_categories" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "expenses_user_id_idx" ON "expenses" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "routine_tasks_user_id_idx" ON "routine_tasks" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "timer_sessions_user_id_idx" ON "timer_sessions" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "life_notes_user_id_idx" ON "life_notes" USING btree ("user_id");
