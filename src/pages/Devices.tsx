import { useEffect, useState } from "react";
import { Search, Smartphone } from "lucide-react";
import { api, messageOf } from "../lib/api";
import type { Device } from "../types";
import { DeviceCard } from "../components/DeviceCard";
export function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/devices")
      .then((r) => setDevices(r.data.devices))
      .catch((e) => setError(messageOf(e)))
      .finally(() => setLoading(false));
  }, []);
  const shown = devices.filter((d) =>
    `${d.childName} ${d.deviceName}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[.18em] text-primary">
            Device management
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Family devices
          </h1>
          <p className="mt-2 text-base-content/55">
            Manage enrollment, permissions, and healthy-use rules.
          </p>
        </div>
        <span className="badge badge-neutral px-4 py-4">
          {devices.length} connected
        </span>
      </div>
      <label className="input input-bordered mt-7 flex max-w-md items-center gap-2 bg-base-100">
        <Search size={17} />
        <input
          className="grow"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a child or device"
        />
      </label>
      {error ? (
        <div className="alert alert-error mt-6">{error}</div>
      ) : loading ? (
        <div className="grid min-h-56 place-items-center">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : shown.length ? (
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((d) => (
            <DeviceCard device={d} key={d._id} />
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-3xl border border-dashed border-base-300 bg-base-100 py-14 text-center text-base-content/45">
          <Smartphone className="mx-auto" size={40} />
          <p className="mt-3 font-semibold">No matching devices</p>
        </div>
      )}
    </div>
  );
}
