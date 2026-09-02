import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  HeartHandshake,
  LockKeyhole,
  MapPin,
  Mic,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api, messageOf } from "../lib/api";
import type { Device } from "../types";

export function SafetyCenter() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/devices")
      .then((r) => setDevices(r.data.devices))
      .catch((e) => setError(messageOf(e)));
  }, []);
  const permissions = useMemo(
    () =>
      devices.flatMap((d) =>
        d.permissions.map((p) => ({
          ...p,
          childName: d.childName,
          deviceId: d._id,
        })),
      ),
    [devices],
  );
  const granted = permissions.filter((p) => p.status === "granted").length;
  return (
    <div className="mx-auto max-w-7xl">
      <div className="relative overflow-hidden rounded-3xl bg-[#071f1a] p-7 text-white shadow-xl md:p-10">
        <div className="absolute -right-16 -top-24 size-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative max-w-2xl">
          <div className="badge badge-secondary mb-5 gap-2 border-0 font-bold">
            <HeartHandshake size={14} />
            Trust by design
          </div>
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Your family safety center
          </h1>
          <p className="mt-4 leading-7 text-white/65">
            A clear view of device access, privacy boundaries, and anything that
            needs a conversation—not hidden surveillance.
          </p>
        </div>
        <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/8 p-4">
            <p className="text-3xl font-black">{devices.length}</p>
            <p className="text-sm text-white/55">Connected devices</p>
          </div>
          <div className="rounded-2xl bg-white/8 p-4">
            <p className="text-3xl font-black">
              {granted}/{permissions.length}
            </p>
            <p className="text-sm text-white/55">Access items enabled</p>
          </div>
          <div className="rounded-2xl bg-white/8 p-4">
            <p className="text-3xl font-black">
              {permissions.filter((p) => p.status !== "granted").length}
            </p>
            <p className="text-sm text-white/55">Items to review</p>
          </div>
        </div>
      </div>
      {error && <div className="alert alert-error mt-6">{error}</div>}
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <section className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="card-title">Permission transparency</h2>
                <p className="text-sm text-base-content/45">
                  Live status reported by each child device
                </p>
              </div>
              <ShieldCheck className="text-primary" />
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Child device</th>
                    <th>Access</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((p, i) => (
                    <tr key={`${p.deviceId}-${p.key}-${i}`}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="grid size-9 place-items-center rounded-xl bg-base-200">
                            <Smartphone size={16} />
                          </div>
                          <span className="font-bold">{p.childName}</span>
                        </div>
                      </td>
                      <td>{p.label}</td>
                      <td>
                        <span
                          className={`badge badge-sm gap-1 border-0 ${p.status === "granted" ? "badge-success text-white" : "badge-warning"}`}
                        >
                          {p.status === "granted" ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <AlertTriangle size={12} />
                          )}{" "}
                          {p.status.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <Link
                          className="btn btn-ghost btn-xs"
                          to={`/devices/${p.deviceId}`}
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!permissions.length && (
                <div className="py-12 text-center text-sm text-base-content/45">
                  Connect a child device to see its access status.
                </div>
              )}
            </div>
          </div>
        </section>
        <aside className="space-y-5">
          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Built-in boundaries</h2>
              <div className="mt-2 space-y-4">
                {[
                  {
                    icon: Eye,
                    title: "Always visible",
                    detail: "Monitoring access is shown on the child phone.",
                  },
                  {
                    icon: MapPin,
                    title: "Location sessions",
                    detail: "Child-started with an ongoing notification.",
                  },
                  {
                    icon: Mic,
                    title: "Audio clips",
                    detail: "Recorded and shared only from the open app.",
                  },
                  {
                    icon: LockKeyhole,
                    title: "Parent-only account",
                    detail: "Dashboard access requires authentication.",
                  },
                ].map(({ icon: Icon, title, detail }) => (
                  <div className="flex gap-3" key={title}>
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{title}</p>
                      <p className="text-xs leading-5 text-base-content/45">
                        {detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="rounded-2xl bg-secondary/20 p-5">
            <p className="text-xs font-black uppercase tracking-[.16em] text-secondary-content/60">
              Family conversation
            </p>
            <p className="mt-2 font-extrabold text-secondary-content">
              Review permissions together whenever needs change.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
