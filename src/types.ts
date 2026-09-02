export type Permission = {
  key: string;
  label: string;
  status: "granted" | "denied" | "not_requested";
  updatedAt?: string;
};
export type Device = {
  _id: string;
  childName: string;
  deviceName: string;
  platform: string;
  androidVersion?: string;
  status: "online" | "offline" | "attention";
  batteryLevel?: number;
  isCharging: boolean;
  storageTotalBytes?: number;
  storageFreeBytes?: number;
  installedApps: InstalledApp[];
  appInventoryUpdatedAt?: string;
  lastSeenAt: string;
  enrolledAt: string;
  permissions: Permission[];
  settings: {
    dailyLimitMinutes: number;
    bedtimeStart: string;
    bedtimeEnd: string;
    webFilterEnabled: boolean;
  };
};
export type InstalledApp = {
  packageName: string;
  appName: string;
  versionName?: string;
  isSystem: boolean;
};
export type Usage = {
  _id: string;
  capturedAt: string;
  screenTimeMinutes: number;
  unlockCount: number;
  apps: {
    packageName: string;
    appName: string;
    minutes: number;
    category?: string;
  }[];
};
export type Audit = {
  _id: string;
  action: string;
  detail?: string;
  actor: string;
  createdAt: string;
};
export type LocationSnapshot = {
  _id: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  capturedAt: string;
  sharingMode: "check_in" | "visible_session";
};
export type SharedRecording = {
  _id: string;
  url: string;
  durationSeconds: number;
  bytes?: number;
  recordedAt: string;
  consentMode: "child_initiated";
};
export type SharedMedia = {
  _id: string;
  url: string;
  bytes?: number;
  source: "camera_check_in" | "selected_gallery";
  sharedAt: string;
  consentMode: "child_initiated";
};
export type SharedDocument = {
  _id: string;
  url: string;
  displayName: string;
  mimeType: string;
  bytes?: number;
  sharedAt: string;
  consentMode: "child_initiated";
};
export type User = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
};
