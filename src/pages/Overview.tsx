import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Clock3,
  Plus,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import { api, messageOf } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { Device } from "../types";
import { DeviceCard } from "../components/DeviceCard";

export function Overview() {
  const { user, token } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [childName, setChildName] = useState("");
  const [code, setCode] = useState<{ code: string; expiresAt: string } | null>(
    null,
  );
  const [error, setError] = useState("");
  const load = useCallback(() => {
    setLoading(true);
    setError("");
    return api
      .get("/devices")
      .then((r) => setDevices(r.data.devices))
      .catch((e) => setError(messageOf(e)))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    load();
    const socket = io(
      import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000",
      { auth: { token } },
    );
    socket.on("device:updated", load);
    socket.on("usage:updated", load);
    return () => {
      socket.disconnect();
    };
  }, [load, token]);
  const online = useMemo(
    () =>
      devices.filter(
        (d) => Date.now() - new Date(d.lastSeenAt).getTime() < 600000,
      ).length,
    [devices],
  );
  async function createCode() {
    setError("");
    try {
      const { data } = await api.post("/devices/enrollment-code", {
        childName,
      });
      setCode(data);
    } catch (e) {
      setError(messageOf(e));
    }
  }
  const today = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold text-primary">{today}</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">
            Good evening, {user?.name?.split(" ")[0]}.
          </h1>
          <p className="mt-2 text-base-content/55">
            Here’s how your family’s digital day is going.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={18} />
          Connect a device
        </button>
      </div>
      {error && !showAdd && (
        <div className="alert alert-error mt-6">
          <span>{error}</span>
          <button className="btn btn-sm" onClick={() => void load()}>
            Try again
          </button>
        </div>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Family devices",
            value: devices.length,
            sub: `${online} currently online`,
            icon: Smartphone,
            color: "bg-primary/10 text-primary",
          },
          {
            label: "Protected today",
            value: online,
            sub: "Active safety profiles",
            icon: ShieldCheck,
            color: "bg-success/10 text-success",
          },
          {
            label: "Average screen time",
            value: "2h 18m",
            sub: "14m less than yesterday",
            icon: Clock3,
            color: "bg-secondary/20 text-secondary-content",
          },
          {
            label: "Needs attention",
            value: devices.filter((d) =>
              d.permissions.some((p) => p.status === "denied"),
            ).length,
            sub: "Review device permissions",
            icon: Activity,
            color: "bg-warning/15 text-warning",
          },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div
            key={label}
            className="card border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="card-body p-5">
              <div
                className={`grid size-10 place-items-center rounded-xl ${color}`}
              >
                <Icon size={20} />
              </div>
              <p className="mt-3 text-3xl font-black">{value}</p>
              <p className="text-sm font-bold">{label}</p>
              <p className="text-xs text-base-content/45">{sub}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold">Your family</h2>
          <p className="text-sm text-base-content/50">
            Live status across enrolled devices
          </p>
        </div>
        <Link to="/devices" className="btn btn-ghost btn-sm text-primary">
          See all
        </Link>
      </div>
      {loading ? (
        <div className="grid min-h-56 place-items-center">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : devices.length ? (
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {devices.map((d) => (
            <DeviceCard key={d._id} device={d} />
          ))}
        </div>
      ) : (
        !error && (
          <div className="mt-5 rounded-3xl border border-dashed border-primary/30 bg-primary/5 p-12 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-white">
              <Smartphone />
            </div>
            <h3 className="mt-5 text-xl font-extrabold">
              Connect your first child device
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-base-content/55">
              Generate a short-lived code here, then enter it in the Guardian
              Child app while you and your child review the permissions
              together.
            </p>
            <button
              className="btn btn-primary mt-6"
              onClick={() => setShowAdd(true)}
            >
              Get enrollment code
            </button>
          </div>
        )
      )}
      {showAdd && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-lg">
            <button
              className="btn btn-ghost btn-sm btn-circle absolute right-4 top-4"
              onClick={() => {
                setShowAdd(false);
                setCode(null);
              }}
            >
              <X size={18} />
            </button>
            {!code ? (
              <>
                <p className="text-xs font-extrabold uppercase tracking-[.18em] text-primary">
                  New device
                </p>
                <h3 className="mt-2 text-2xl font-black">
                  Who is this device for?
                </h3>
                <p className="mt-2 text-sm leading-6 text-base-content/55">
                  The child’s name is only shown inside your private family
                  dashboard.
                </p>
                {error && (
                  <div className="alert alert-error mt-4 text-sm">{error}</div>
                )}
                <input
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="input input-bordered mt-6 w-full"
                  placeholder="Child's first name"
                />
                <button
                  className="btn btn-primary mt-4 w-full"
                  disabled={childName.trim().length < 2}
                  onClick={createCode}
                >
                  Generate secure code
                </button>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-success/10 text-success">
                  <ShieldCheck />
                </div>
                <h3 className="mt-4 text-2xl font-black">
                  Enter this code on the child device
                </h3>
                <p className="mt-2 text-sm text-base-content/55">
                  It expires in 15 minutes and can only be used once.
                </p>
                <div className="my-7 rounded-2xl bg-neutral px-4 py-6 font-mono text-4xl font-black tracking-[.18em] text-white">
                  {code.code}
                </div>
                <ol className="steps steps-vertical text-left text-sm">
                  <li className="step step-primary">Open Guardian Child</li>
                  <li className="step step-primary">
                    Review the disclosure together
                  </li>
                  <li className="step step-primary">
                    Enter the code and approve chosen access
                  </li>
                </ol>
              </div>
            )}
          </div>
          <div
            className="modal-backdrop bg-black/35"
            onClick={() => setShowAdd(false)}
          />
        </dialog>
      )}
    </div>
  );
}
