import type { LifeOsState } from "../life-os-state/life-os-state.types";

export const settingsId = "default";

// Do not seed personal data. A newly registered user receives an empty workspace.
export const defaultState: LifeOsState = {
  categories: [],
  expenses: [],
  tasks: [],
  timerSessions: [],
  notes: [],
  settings: {
    profileName: "",
    profileEmail: "",
    profilePhone: "",
    profileLocation: "",
    profileRole: "",
    profileBio: "",
    profileImage: "",
    currency: "BDT",
    notificationEnabled: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
    aiProvider: "off",
  },
};
