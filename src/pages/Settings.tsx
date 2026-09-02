import { useState, type FormEvent } from "react";
import {
  BellRing,
  Check,
  Database,
  KeyRound,
  LockKeyhole,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { api, messageOf } from "../lib/api";
import { useAuth } from "../lib/auth";

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [alerts, setAlerts] = useState(() =>
    JSON.parse(
      localStorage.getItem("guardian_alerts") ??
        '{"offline":true,"permission":true,"limit":true,"weekly":false}',
    ),
  );
  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { data } = await api.patch("/auth/me", { name });
      updateUser({ ...data.user, id: data.user._id });
      setNotice("Profile updated");
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setSaving(false);
    }
  }
  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await api.post("/auth/change-password", {
        currentPassword: form.get("currentPassword"),
        newPassword: form.get("newPassword"),
      });
      event.currentTarget.reset();
      setNotice("Password changed successfully");
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setSaving(false);
    }
  }
  function saveAlerts(next: typeof alerts) {
    setAlerts(next);
    localStorage.setItem("guardian_alerts", JSON.stringify(next));
    setNotice("Notification preferences saved");
  }
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[.18em] text-primary">
            Account & preferences
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Settings</h1>
          <p className="mt-2 text-base-content/55">
            Manage your parent profile, alerts, and account security.
          </p>
        </div>
        <div className="badge badge-success gap-2 border-0 px-4 py-4 text-white">
          <ShieldCheck size={15} />
          Account protected
        </div>
      </div>
      {(notice || error) && (
        <div
          className={`alert mt-6 ${error ? "alert-error" : "alert-success text-white"}`}
        >
          {error ? <LockKeyhole size={18} /> : <Check size={18} />}
          <span>{error || notice}</span>
          <button
            onClick={() => {
              setNotice("");
              setError("");
            }}
          >
            ×
          </button>
        </div>
      )}
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-6">
          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <form className="card-body" onSubmit={saveProfile}>
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <UserRound size={21} />
                </div>
                <div>
                  <h2 className="font-extrabold">Parent profile</h2>
                  <p className="text-xs text-base-content/45">
                    Shown only inside your family space
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-4">
                <div className="avatar placeholder">
                  <div className="w-16 rounded-2xl bg-primary text-xl font-black text-white">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} />
                    ) : (
                      <span>{user?.name?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-bold">{user?.email}</p>
                  <p className="text-xs text-base-content/45">
                    Verified parent email
                  </p>
                </div>
              </div>
              <label className="form-control mt-4">
                <span className="label mb-2 text-sm font-bold">
                  Display name
                </span>
                <input
                  className="input input-bordered w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={2}
                  required
                />
              </label>
              <button
                className="btn btn-primary mt-3 self-end"
                disabled={saving || name.trim() === user?.name}
              >
                <Save size={17} />
                Save profile
              </button>
            </form>
          </section>
          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-secondary/20 text-secondary-content">
                  <BellRing size={21} />
                </div>
                <div>
                  <h2 className="font-extrabold">Family alerts</h2>
                  <p className="text-xs text-base-content/45">
                    Choose what deserves your attention
                  </p>
                </div>
              </div>
              <div className="mt-4 divide-y divide-base-200">
                {[
                  {
                    key: "offline",
                    title: "Device goes offline",
                    detail: "Notify after a device misses expected syncs",
                  },
                  {
                    key: "permission",
                    title: "Permission changes",
                    detail: "Know when child-controlled access changes",
                  },
                  {
                    key: "limit",
                    title: "Daily limit reached",
                    detail: "Receive a healthy-use limit alert",
                  },
                  {
                    key: "weekly",
                    title: "Weekly family summary",
                    detail: "A calm overview every Sunday",
                  },
                ].map((item) => (
                  <label
                    className="flex cursor-pointer items-center justify-between gap-4 py-4"
                    key={item.key}
                  >
                    <span>
                      <span className="block text-sm font-bold">
                        {item.title}
                      </span>
                      <span className="text-xs text-base-content/45">
                        {item.detail}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={alerts[item.key]}
                      onChange={(e) =>
                        saveAlerts({ ...alerts, [item.key]: e.target.checked })
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          </section>
        </div>
        <div className="space-y-6">
          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <form className="card-body" onSubmit={changePassword}>
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-warning/15 text-warning">
                  <KeyRound size={21} />
                </div>
                <div>
                  <h2 className="font-extrabold">Change password</h2>
                  <p className="text-xs text-base-content/45">
                    Use at least 8 characters
                  </p>
                </div>
              </div>
              <label className="form-control mt-4">
                <span className="label mb-2 text-sm font-bold">
                  Current password
                </span>
                <input
                  className="input input-bordered"
                  type="password"
                  name="currentPassword"
                  minLength={8}
                  required
                />
              </label>
              <label className="form-control mt-3">
                <span className="label mb-2 text-sm font-bold">
                  New password
                </span>
                <input
                  className="input input-bordered"
                  type="password"
                  name="newPassword"
                  minLength={8}
                  required
                />
              </label>
              <button className="btn btn-neutral mt-4" disabled={saving}>
                <LockKeyhole size={17} />
                Update password
              </button>
            </form>
          </section>
          <section className="card overflow-hidden border border-base-300 bg-neutral text-neutral-content shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <Database className="text-secondary" />
                <h2 className="font-extrabold">Your family data</h2>
              </div>
              <p className="text-sm leading-6 text-white/65">
                Location and audio are shared only from visible child-device
                controls. Removing a device deletes its server-side usage,
                location, command, and recording records.
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs font-bold text-secondary">
                <ShieldCheck size={15} />
                Consent-first data model
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
