import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DRIZZLE, type Database } from "../db/database.module";
import { lifeSettings } from "../db/schema";
import { defaultState } from "../shared/life-os.defaults";
import { settingsFromRow, toSettingsValues } from "../shared/life-os.mapper";
import { normalizeSettings } from "../shared/life-os.validation";
import type { LifeSettings } from "./settings.types";

@Injectable()
export class SettingsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async find(userId: string) {
    const settings = await this.db.query.lifeSettings.findFirst({ where: eq(lifeSettings.id, userId) });
    return settings ? settingsFromRow(settings) : defaultState.settings;
  }

  async update(userId: string, payload: Partial<LifeSettings>) {
    const current = await this.find(userId);
    const settings = normalizeSettings({ ...current, ...payload });
    const { id: _settingsId, ...settingsValues } = toSettingsValues(settings);
    const [row] = await this.db
      .insert(lifeSettings)
      .values({ ...settingsValues, id: userId })
      .onConflictDoUpdate({
        target: lifeSettings.id,
        set: settingsValues,
      })
      .returning();

    return settingsFromRow(row);
  }
}
