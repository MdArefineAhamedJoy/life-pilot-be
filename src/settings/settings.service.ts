import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DRIZZLE, type Database } from "../db/database.module";
import { lifeSettings } from "../db/schema";
import { defaultState, settingsId } from "../shared/life-os.defaults";
import { settingsFromRow, toSettingsValues } from "../shared/life-os.mapper";
import { normalizeSettings } from "../shared/life-os.validation";
import type { LifeSettings } from "./settings.types";

@Injectable()
export class SettingsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async find() {
    const settings = await this.db.query.lifeSettings.findFirst({ where: eq(lifeSettings.id, settingsId) });
    return settings ? settingsFromRow(settings) : defaultState.settings;
  }

  async update(payload: Partial<LifeSettings>) {
    const current = await this.find();
    const settings = normalizeSettings({ ...current, ...payload });
    const [row] = await this.db
      .insert(lifeSettings)
      .values(toSettingsValues(settings))
      .onConflictDoUpdate({
        target: lifeSettings.id,
        set: toSettingsValues(settings),
      })
      .returning();

    return settingsFromRow(row);
  }
}
