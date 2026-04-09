import { Package, Truck, CheckCircle, MapPin } from "lucide-react";

interface TrackingEvent {
  status: string;
  description: string;
  timestamp: string;
}

interface Props {
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  estimatedDate: string | null;
  events: unknown[];
}

function EventIcon({ index, total }: { index: number; total: number }) {
  if (index === total - 1) return <CheckCircle size={16} className="text-green-400" />;
  if (index === 0) return <Package size={16} className="text-slate-400" />;
  return <Truck size={16} className="text-brand" />;
}

export function OrderTrackingTimeline({
  carrier,
  trackingNumber,
  trackingUrl,
  estimatedDate,
  events,
}: Props) {
  const typedEvents = (events as TrackingEvent[]).slice().reverse();

  return (
    <div className="flex flex-col gap-4">
      {/* Tracking info */}
      {(carrier || trackingNumber) && (
        <div className="rounded-xl border border-surface-border bg-surface px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2">
          <Truck size={16} className="text-brand shrink-0" />
          <div className="flex-1">
            {carrier && <span className="text-sm font-medium text-white">{carrier}</span>}
            {trackingNumber && (
              <span className="text-sm text-slate-400 ml-2">#{trackingNumber}</span>
            )}
          </div>
          {trackingUrl && (
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand hover:text-brand-light transition-colors"
            >
              Ver seguimiento →
            </a>
          )}
        </div>
      )}

      {/* Estimated delivery */}
      {estimatedDate && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <MapPin size={14} className="text-brand shrink-0" />
          <span>
            Entrega estimada:{" "}
            <span className="text-white font-medium">
              {new Date(estimatedDate).toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
          </span>
        </div>
      )}

      {/* Events timeline */}
      {typedEvents.length > 0 ? (
        <div className="flex flex-col gap-0">
          {typedEvents.map((event, index) => (
            <div key={index} className="flex gap-3">
              {/* Icon + line */}
              <div className="flex flex-col items-center shrink-0">
                <div className="mt-1">
                  <EventIcon index={index} total={typedEvents.length} />
                </div>
                {index < typedEvents.length - 1 && (
                  <div className="w-px flex-1 bg-surface-border mt-1 mb-0 min-h-[20px]" />
                )}
              </div>

              {/* Content */}
              <div className="pb-4 min-w-0">
                <p className="text-sm font-medium text-white">{event.status}</p>
                <p className="text-xs text-slate-400 mt-0.5">{event.description}</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {new Date(event.timestamp).toLocaleString("es-ES", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">El vendedor aún no ha añadido información de envío.</p>
      )}
    </div>
  );
}
