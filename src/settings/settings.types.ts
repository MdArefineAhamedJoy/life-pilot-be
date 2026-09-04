export type LifeSettings = {
  profileName: string;
  profileEmail: string;
  profilePhone: string;
  profileLocation: string;
  profileRole: string;
  profileBio: string;
  profileImage: string;
  currency: string;
  notificationEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  aiProvider: "off" | "free-api" | "local";
};
