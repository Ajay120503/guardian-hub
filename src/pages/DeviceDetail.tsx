import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BatteryCharging,
  Camera,
  Check,
  Clock3,
  Download,
  FileText,
  Moon,
  MapPin,
  Mic,
  HardDrive,
  Image,
  MessageSquareText,
  PackageSearch,
  Pencil,
  RefreshCw,
  Send,
  Search,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api, messageOf } from "../lib/api";
import type {
  Audit,
  Device,
  LocationSnapshot,
  SharedMedia,
  SharedDocument,
  SharedRecording,
  Usage,
} from "../types";
export function DeviceDetail() {
  const { deviceId } = useParams();
  const [device, setDevice] = useState<Device | null>(null);
  const [usage, setUsage] = useState<Usage[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [locations, setLocations] = useState<LocationSnapshot[]>([]);
  const [recordings, setRecordings] = useState<SharedRecording[]>([]);
  const [media, setMedia] = useState<SharedMedia[]>([]);
  const [documents, setDocuments] = useState<SharedDocument[]>([]);
  const [appQuery, setAppQuery] = useState("");
  const [editingChild, setEditingChild] = useState(false);
  const [childNameDraft, setChildNameDraft] = useState("");
  const [savingChild, setSavingChild] = useState(false);
  const [parentMessage, setParentMessage] = useState("");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const load = () =>
    api
      .get(`/devices/${deviceId}`)
      .then((r) => {
        setDevice(r.data.device);
        setUsage(r.data.usage);
        setAudit(r.data.audit);
        setLocations(r.data.locations ?? []);
        setRecordings(r.data.recordings ?? []);
        setMedia(r.data.media ?? []);
        setDocuments(r.data.documents ?? []);
      })
      .catch((e) => setError(messageOf(e)));
  useEffect(() => {
    void load();
  }, [deviceId]);
  const latest = usage[0];
  const filteredApps = useMemo(() => {
    const query = appQuery.trim().toLowerCase();
    const apps = device?.installedApps ?? [];
    if (!query) return apps;
    return apps.filter(
      (app) =>
        app.appName.toLowerCase().includes(query) ||
        app.packageName.toLowerCase().includes(query),
    );
  }, [appQuery, device?.installedApps]);
  const chart = useMemo(
    () =>
      [...usage].reverse().map((u) => ({
        day: new Date(u.capturedAt).toLocaleDateString(undefined, {
          weekday: "short",
        }),
        minutes: u.screenTimeMinutes,
      })),
    [usage],
  );
  async function sync() {
    await api.post(`/devices/${deviceId}/commands`, {
      type: "sync_now",
      payload: {},
    });
    setToast("Sync requested on the child device");
  }
  async function save() {
    if (!device) return;
    await api.patch(`/devices/${deviceId}/settings`, device.settings);
    setToast("Safety settings saved");
  }
  async function sendMessage() {
    if (!parentMessage.trim()) return;
    await api.post(`/devices/${deviceId}/commands`, {
      type: "show_message",
      payload: { message: parentMessage.trim() },
    });
    setParentMessage("");
    setToast("Family message queued for the child device");
  }
  function beginChildEdit() {
    if (!device) return;
    setChildNameDraft(device.childName);
    setEditingChild(true);
  }
  async function updateChildProfile() {
    const childName = childNameDraft.trim();
    if (!device || childName.length < 2) return;
    setSavingChild(true);
    setError("");
    try {
      const response = await api.patch(`/devices/${deviceId}/profile`, {
        childName,
      });
      setDevice(response.data.device);
      setEditingChild(false);
      setToast("Child profile updated");
    } catch (requestError) {
      setToast(messageOf(requestError));
    } finally {
      setSavingChild(false);
    }
  }
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!device)
    return (
      <div className="grid min-h-72 place-items-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  return (
    <div className="mx-auto max-w-7xl">
      <Link to="/devices" className="btn btn-ghost btn-sm -ml-3">
        <ArrowLeft size={17} />
        All devices
      </Link>
      <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
            <Smartphone size={30} />
          </div>
          <div>
            {editingChild ? (
              <div className="rounded-2xl border border-primary/20 bg-base-100 p-4 shadow-lg">
                <label className="text-xs font-extrabold uppercase tracking-wider text-primary">
                  Who is this device for?
                </label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    autoFocus
                    className="input input-bordered input-sm min-w-64"
                    maxLength={60}
                    value={childNameDraft}
                    onChange={(event) => setChildNameDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void updateChildProfile();
                      if (event.key === "Escape") setEditingChild(false);
                    }}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={childNameDraft.trim().length < 2 || savingChild}
                    onClick={updateChildProfile}
                  >
                    {savingChild ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <Check size={15} />
                    )}
                    Save
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={savingChild}
                    onClick={() => setEditingChild(false)}
                  >
                    Cancel
                  </button>
                </div>
                <p className="mt-2 text-xs text-base-content/45">
                  The child’s name is only shown inside your private family dashboard.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black">{device.childName}</h1>
                <button
                  className="btn btn-ghost btn-circle btn-sm"
                  aria-label="Edit child name"
                  title="Edit child name"
                  onClick={beginChildEdit}
                >
                  <Pencil size={16} />
                </button>
                <span className="badge badge-success text-white">Online</span>
              </div>
            )}
            <p className="mt-1 text-base-content/50">
              {device.deviceName} · Android {device.androidVersion ?? "—"}
            </p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={sync}>
          <RefreshCw size={17} />
          Request fresh sync
        </button>
      </div>
      {toast && (
        <div className="toast toast-end toast-top z-50">
          <div className="alert alert-success text-white">
            <Check size={18} />
            {toast}
            <button onClick={() => setToast("")}>×</button>
          </div>
        </div>
      )}
      <div className="mt-7 flex gap-2 overflow-x-auto rounded-2xl border border-base-300 bg-base-100 p-2 shadow-sm">
        {[
          { href: "#usage", label: "Screen time", icon: Clock3 },
          { href: "#apps", label: "Installed apps", icon: PackageSearch },
          { href: "#location", label: "Location", icon: MapPin },
          { href: "#media", label: "Photos", icon: Image },
          { href: "#files", label: "Files", icon: FileText },
          { href: "#audio", label: "Audio clips", icon: Mic },
          { href: "#controls", label: "Controls", icon: ShieldCheck },
        ].map(({ href, label, icon: Icon }) => (
          <a href={href} className="btn btn-ghost btn-sm shrink-0" key={href}>
            <Icon size={15} />
            {label}
          </a>
        ))}
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="stat rounded-2xl border border-base-300 bg-base-100 shadow-sm">
          <div className="stat-figure text-primary">
            <Clock3 />
          </div>
          <div className="stat-title">Screen time today</div>
          <div className="stat-value text-2xl">
            {latest
              ? `${Math.floor(latest.screenTimeMinutes / 60)}h ${latest.screenTimeMinutes % 60}m`
              : "—"}
          </div>
          <div className="stat-desc">
            Daily limit: {Math.floor(device.settings.dailyLimitMinutes / 60)}h{" "}
            {device.settings.dailyLimitMinutes % 60}m
          </div>
        </div>
        <div className="stat rounded-2xl border border-base-300 bg-base-100 shadow-sm">
          <div className="stat-figure text-success">
            <BatteryCharging />
          </div>
          <div className="stat-title">Battery</div>
          <div className="stat-value text-2xl">
            {device.batteryLevel ?? "—"}%
          </div>
          <div className="stat-desc">
            {device.isCharging ? "Charging now" : "On battery"}
          </div>
        </div>
        <div className="stat rounded-2xl border border-base-300 bg-base-100 shadow-sm">
          <div className="stat-figure text-secondary">
            <ShieldCheck />
          </div>
          <div className="stat-title">Permission health</div>
          <div className="stat-value text-2xl">
            {device.permissions.filter((p) => p.status === "granted").length}/
            {device.permissions.length}
          </div>
          <div className="stat-desc">Always visible on child device</div>
        </div>
        <div className="stat rounded-2xl border border-base-300 bg-base-100 shadow-sm">
          <div className="stat-figure text-info">
            <HardDrive />
          </div>
          <div className="stat-title">Storage available</div>
          <div className="stat-value text-2xl">
            {device.storageFreeBytes != null
              ? `${(device.storageFreeBytes / 1073741824).toFixed(1)} GB`
              : "—"}
          </div>
          <div className="stat-desc">
            of{" "}
            {device.storageTotalBytes != null
              ? `${(device.storageTotalBytes / 1073741824).toFixed(1)} GB`
              : "unknown"}
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section
          id="location"
          className="card scroll-mt-28 border border-base-300 bg-base-100 shadow-sm"
        >
          <div className="card-body">
            <h2 className="card-title">
              <MapPin size={20} />
              Visible location sharing
            </h2>
            <p className="text-sm text-base-content/45">
              Updates appear only during a session started on the child device.
            </p>
            {locations[0] ? (
              <>
                <div className="mt-4 rounded-2xl bg-primary/8 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">
                    Latest position
                  </p>
                  <p className="mt-2 font-mono text-lg font-bold">
                    {locations[0].latitude.toFixed(6)},{" "}
                    {locations[0].longitude.toFixed(6)}
                  </p>
                  <p className="mt-1 text-xs text-base-content/50">
                    Accuracy ±{Math.round(locations[0].accuracyMeters ?? 0)} m ·{" "}
                    {new Date(locations[0].capturedAt).toLocaleString()}
                  </p>
                </div>
                <a
                  className="btn btn-outline btn-primary mt-4"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://www.google.com/maps?q=${locations[0].latitude},${locations[0].longitude}`}
                >
                  <MapPin size={17} />
                  Open in maps
                </a>
              </>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-base-300 p-8 text-center text-sm text-base-content/45">
                No location has been shared yet.
              </div>
            )}
          </div>
        </section>
        <section
          id="audio"
          className="card scroll-mt-28 border border-base-300 bg-base-100 shadow-sm"
        >
          <div className="card-body">
            <h2 className="card-title">
              <Mic size={20} />
              Shared audio clips
            </h2>
            <p className="text-sm text-base-content/45">
              Every clip was recorded and shared using the visible child-app
              controls.
            </p>
            <div className="mt-3 max-h-64 space-y-3 overflow-auto">
              {recordings.map((recording) => (
                <div
                  className="rounded-2xl bg-base-200 p-3"
                  key={recording._id}
                >
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="font-bold">
                      {recording.durationSeconds}s clip
                    </span>
                    <span className="text-base-content/45">
                      {new Date(recording.recordedAt).toLocaleString()}
                    </span>
                  </div>
                  <audio
                    controls
                    preload="none"
                    className="h-9 w-full"
                    src={recording.url}
                  />
                </div>
              ))}
              {!recordings.length && (
                <div className="rounded-2xl border border-dashed border-base-300 p-8 text-center text-sm text-base-content/45">
                  No audio clips have been shared.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
      <section
        id="media"
        className="card mt-6 scroll-mt-28 border border-base-300 bg-base-100 shadow-sm"
      >
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="card-title">
                <Camera size={20} />
                Child-shared photos
              </h2>
              <p className="text-sm text-base-content/45">
                Camera check-ins and individually selected gallery images
              </p>
            </div>
            <span className="badge badge-neutral">{media.length} items</span>
          </div>
          {media.length ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {media.map((item) => (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative aspect-square overflow-hidden rounded-2xl bg-base-200"
                  key={item._id}
                >
                  <img
                    src={item.url}
                    className="size-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="absolute inset-x-2 bottom-2 rounded-lg bg-black/55 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                    {item.source === "camera_check_in"
                      ? "Camera check-in"
                      : "Selected image"}
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-base-300 p-9 text-center text-sm text-base-content/45">
              No photos shared yet. The child can use Camera or Gallery from the
              Share tab.
            </div>
          )}
        </div>
      </section>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <section
          id="apps"
          className="card scroll-mt-28 border border-base-300 bg-base-100 shadow-sm"
        >
          <div className="card-body">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="card-title">
                  <PackageSearch size={20} />
                  Installed apps
                </h2>
                <p className="text-sm text-base-content/45">
                  Launchable apps reported by Android · {device.installedApps?.length ?? 0} total
                </p>
              </div>
              <label className="input input-bordered input-sm flex items-center gap-2">
                <Search size={15} className="text-base-content/40" />
                <input
                  className="grow"
                  placeholder="Search apps"
                  value={appQuery}
                  onChange={(event) => setAppQuery(event.target.value)}
                />
              </label>
            </div>
            <div className="mt-4 max-h-96 overflow-auto rounded-2xl border border-base-200">
              <table className="table table-sm table-pin-rows">
                <thead>
                  <tr>
                    <th>App</th>
                    <th>Package</th>
                    <th>Version</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.map((app) => (
                    <tr key={app.packageName}>
                      <td className="font-bold">{app.appName}</td>
                      <td className="max-w-64 truncate font-mono text-xs text-base-content/50">
                        {app.packageName}
                      </td>
                      <td className="text-xs">{app.versionName || "—"}</td>
                      <td>
                        <span className="badge badge-ghost badge-sm">
                          {app.isSystem ? "System" : "Installed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredApps.length && (
                <p className="p-8 text-center text-sm text-base-content/45">
                  {appQuery ? "No apps match your search." : "The app inventory has not synced yet."}
                </p>
              )}
            </div>
            {device.appInventoryUpdatedAt && (
              <p className="text-xs text-base-content/40">
                Updated {new Date(device.appInventoryUpdatedAt).toLocaleString()}
              </p>
            )}
          </div>
        </section>
        <section
          id="files"
          className="card scroll-mt-28 border border-base-300 bg-base-100 shadow-sm"
        >
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title">
                <FileText size={20} />
                Shared files
              </h2>
              <span className="badge badge-neutral">{documents.length}</span>
            </div>
            <p className="text-sm text-base-content/45">
              Documents individually chosen in the child app.
            </p>
            <div className="mt-3 max-h-96 space-y-2 overflow-auto">
              {documents.map((document) => (
                <a
                  key={document._id}
                  href={document.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-base-200 p-3 transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FileText size={18} />
                  </span>
                  <span className="min-w-0 grow">
                    <span className="block truncate text-sm font-bold">{document.displayName}</span>
                    <span className="block text-xs text-base-content/45">
                      {document.bytes != null ? `${(document.bytes / 1024).toFixed(1)} KB · ` : ""}
                      {new Date(document.sharedAt).toLocaleString()}
                    </span>
                  </span>
                  <Download size={17} className="shrink-0 text-primary" />
                </a>
              ))}
              {!documents.length && (
                <div className="rounded-2xl border border-dashed border-base-300 p-8 text-center text-sm text-base-content/45">
                  No documents shared yet. The child can choose one from the Share tab.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.8fr]">
        <section
          id="usage"
          className="card scroll-mt-28 border border-base-300 bg-base-100 shadow-sm"
        >
          <div className="card-body">
            <h2 className="card-title">7-day screen time</h2>
            <p className="text-sm text-base-content/45">
              Usage totals shared through Android Usage Access
            </p>
            <div className="mt-5 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="minutes" fill="#158266" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Recently used app</th>
                    <th>Package</th>
                    <th className="text-right">Today</th>
                  </tr>
                </thead>
                <tbody>
                  {latest?.apps?.slice(0, 12).map((app) => (
                    <tr key={app.packageName}>
                      <td className="font-bold">{app.appName}</td>
                      <td className="max-w-48 truncate font-mono text-xs text-base-content/45">
                        {app.packageName}
                      </td>
                      <td className="text-right">{app.minutes}m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!latest?.apps?.length && (
                <p className="py-6 text-center text-sm text-base-content/45">
                  No app activity has synced yet.
                </p>
              )}
            </div>
          </div>
        </section>
        <section className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">Permission center</h2>
            <p className="text-sm text-base-content/45">
              Only the child can change these on the device.
            </p>
            <div className="mt-3 divide-y divide-base-200">
              {device.permissions.map((p) => (
                <div
                  className="flex items-center justify-between py-4"
                  key={p.key}
                >
                  <div className="flex items-center gap-3">
                    {p.status === "granted" ? (
                      <ShieldCheck className="text-success" size={19} />
                    ) : (
                      <ShieldAlert className="text-warning" size={19} />
                    )}
                    <span className="text-sm font-semibold">{p.label}</span>
                  </div>
                  <span
                    className={`badge badge-sm ${p.status === "granted" ? "badge-success text-white" : "badge-warning"}`}
                  >
                    {p.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <div
        id="controls"
        className="mt-6 grid scroll-mt-28 gap-6 xl:grid-cols-2"
      >
        <section className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">
              <Moon size={20} />
              Healthy-use rules
            </h2>
            <label className="form-control mt-4">
              <span className="label text-sm font-bold">
                Daily screen-time limit
              </span>
              <input
                type="range"
                className="range range-primary"
                min={15}
                max={720}
                step={15}
                value={device.settings.dailyLimitMinutes}
                onChange={(e) =>
                  setDevice({
                    ...device,
                    settings: {
                      ...device.settings,
                      dailyLimitMinutes: +e.target.value,
                    },
                  })
                }
              />
              <span className="mt-2 text-sm text-base-content/55">
                {Math.floor(device.settings.dailyLimitMinutes / 60)}h{" "}
                {device.settings.dailyLimitMinutes % 60}m per day
              </span>
            </label>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="form-control">
                <span className="label text-sm font-bold">Bedtime starts</span>
                <input
                  className="input input-bordered"
                  type="time"
                  value={device.settings.bedtimeStart}
                  onChange={(e) =>
                    setDevice({
                      ...device,
                      settings: {
                        ...device.settings,
                        bedtimeStart: e.target.value,
                      },
                    })
                  }
                />
              </label>
              <label className="form-control">
                <span className="label text-sm font-bold">Bedtime ends</span>
                <input
                  className="input input-bordered"
                  type="time"
                  value={device.settings.bedtimeEnd}
                  onChange={(e) =>
                    setDevice({
                      ...device,
                      settings: {
                        ...device.settings,
                        bedtimeEnd: e.target.value,
                      },
                    })
                  }
                />
              </label>
            </div>
            <label className="mt-5 flex items-center justify-between rounded-xl bg-base-200 p-4">
              <span>
                <span className="block text-sm font-bold">
                  Family-safe web filter
                </span>
                <span className="text-xs text-base-content/45">
                  Requires a separate local VPN module
                </span>
              </span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={device.settings.webFilterEnabled}
                onChange={(e) =>
                  setDevice({
                    ...device,
                    settings: {
                      ...device.settings,
                      webFilterEnabled: e.target.checked,
                    },
                  })
                }
              />
            </label>
            <button className="btn btn-primary mt-5" onClick={save}>
              Save and send rules
            </button>
          </div>
        </section>
        <section className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">
              <MessageSquareText size={20} />
              Send a family message
            </h2>
            <p className="text-sm text-base-content/45">
              Delivered as a visible notification and shown in the child app.
            </p>
            <textarea
              className="textarea textarea-bordered mt-3 min-h-24"
              maxLength={240}
              placeholder="Dinner is ready in 10 minutes…"
              value={parentMessage}
              onChange={(e) => setParentMessage(e.target.value)}
            />
            <button
              className="btn btn-primary"
              disabled={!parentMessage.trim()}
              onClick={sendMessage}
            >
              <Send size={16} />
              Send message
            </button>
            <div className="divider my-2" />
            <h2 className="card-title">Recent activity</h2>
            <div className="mt-2 space-y-4">
              {audit.slice(0, 6).map((a) => (
                <div className="flex gap-3" key={a._id}>
                  <div className="mt-1 size-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-semibold">
                      {a.detail ?? a.action}
                    </p>
                    <p className="text-xs text-base-content/40">
                      {new Date(a.createdAt).toLocaleString()} ·{" "}
                      {a.actor.replace("_", " ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {!audit.length && (
              <p className="py-8 text-center text-sm text-base-content/45">
                No activity yet
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
