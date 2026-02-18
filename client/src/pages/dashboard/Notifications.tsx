import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  BellOff,
  CheckCheck,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Trash2,
} from "lucide-react";

export default function DashboardNotifications() {
  const notifications = trpc.notifications.list.useQuery();
  const unreadCount = trpc.notifications.unreadCount.useQuery();
  const utils = trpc.useUtils();

  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  const severityConfig: Record<string, { icon: React.ReactNode; color: string }> = {
    info: { icon: <Info className="w-4 h-4 text-cyan" />, color: "border-cyan/30 bg-cyan/5" },
    warning: { icon: <AlertTriangle className="w-4 h-4 text-amber" />, color: "border-amber/30 bg-amber/5" },
    error: { icon: <AlertCircle className="w-4 h-4 text-destructive" />, color: "border-destructive/30 bg-destructive/5" },
    success: { icon: <CheckCircle2 className="w-4 h-4 text-emerald" />, color: "border-emerald/30 bg-emerald/5" },
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan" />
            Notifications
            {(unreadCount.data?.count ?? 0) > 0 && (
              <Badge variant="outline" className="border-cyan/30 text-cyan bg-cyan/10 text-xs ml-1">
                {unreadCount.data?.count} unread
              </Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Channel status changes, failover alerts, and system events.
          </p>
        </div>
        {(unreadCount.data?.count ?? 0) > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="w-3 h-3" />
            Mark All Read
          </Button>
        )}
      </div>

      {notifications.isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : notifications.data && notifications.data.length > 0 ? (
        <div className="space-y-2">
          {notifications.data.map((notif) => {
            const config = severityConfig[notif.severity ?? "info"] ?? severityConfig.info;
            const isUnread = notif.isRead === 0;

            return (
              <div
                key={notif.id}
                className={`rounded-xl border p-4 transition-all ${
                  isUnread
                    ? `${config.color} hover:shadow-sm`
                    : "border-border/30 bg-card/20 opacity-70"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{config.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`text-sm font-semibold ${isUnread ? "" : "text-muted-foreground"}`}>
                        {notif.title}
                      </h4>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {notif.type.replace(/_/g, " ")}
                      </Badge>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-cyan shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : "Unknown"}
                      </span>
                      {notif.actionUrl && (
                        <a
                          href={notif.actionUrl}
                          className="text-[10px] text-cyan hover:underline flex items-center gap-1"
                        >
                          View <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                  {isUnread && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 h-7 w-7 p-0"
                      onClick={() => markRead.mutate({ id: notif.id })}
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <BellOff className="w-10 h-10 mx-auto mb-4 opacity-30" />
          <p className="text-sm font-medium">No notifications yet</p>
          <p className="text-xs mt-1">
            You'll see alerts here when channels connect/disconnect, providers fail over, or other system events occur.
          </p>
        </div>
      )}
    </div>
  );
}
