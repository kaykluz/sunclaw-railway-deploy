import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  MessageSquare,
  Zap,
  AlertTriangle,
  Radio,
  TrendingUp,
  Clock,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend as RechartsLegend,
} from "recharts";

/* ─── Theme-aware chart colors ─── */

const CHART_COLORS = {
  cyan: "oklch(0.78 0.154 211.53)",
  amber: "oklch(0.82 0.165 84.43)",
  orange: "oklch(0.72 0.15 50)",
  emerald: "oklch(0.76 0.17 163.22)",
  purple: "oklch(0.68 0.16 293)",
  rose: "oklch(0.65 0.18 12)",
};

const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: "#25D366",
  telegram: "#0088cc",
  slack: "#4A154B",
  discord: "#5865F2",
  webchat: CHART_COLORS.cyan,
  signal: "#3A76F0",
  teams: "#6264A7",
  email: CHART_COLORS.amber,
  rcs: CHART_COLORS.emerald,
  unknown: "#6b7280",
};

const PIE_COLORS = [
  CHART_COLORS.cyan,
  CHART_COLORS.amber,
  CHART_COLORS.emerald,
  CHART_COLORS.orange,
  CHART_COLORS.purple,
  CHART_COLORS.rose,
];

/* ─── Custom tooltip ─── */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-popover/95 backdrop-blur-sm p-3 shadow-lg">
      <p className="text-xs font-mono text-muted-foreground mb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span
            className="w-2.5 h-2.5 rounded-sm shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground capitalize">
            {entry.dataKey}:
          </span>
          <span className="font-semibold text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border border-border/50 bg-popover/95 backdrop-blur-sm p-3 shadow-lg">
      <div className="flex items-center gap-2 text-xs">
        <span
          className="w-2.5 h-2.5 rounded-sm shrink-0"
          style={{ backgroundColor: entry.payload.fill }}
        />
        <span className="text-muted-foreground capitalize">
          {entry.name.replace(/_/g, " ")}:
        </span>
        <span className="font-semibold text-foreground">{entry.value}</span>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

export default function DashboardAnalytics() {
  const summary = trpc.analytics.summary.useQuery({ days: 30 });
  const timeline = trpc.analytics.timeline.useQuery({ days: 14 });

  /* Format timeline data for Recharts */
  const chartData = useMemo(() => {
    if (!timeline.data) return [];
    return timeline.data.map((day: any) => ({
      date: new Date(day.date + "T00:00:00").toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      messages: day.messages,
      skills: day.skills,
      failovers: day.failovers,
      channels: day.channels,
    }));
  }, [timeline.data]);

  /* Per-channel message breakdown data */
  const channelBreakdownData = useMemo(() => {
    if (!timeline.data) return { chartData: [], channelNames: [] as string[] };
    const allChannels = new Set<string>();
    for (const day of timeline.data as any[]) {
      if (day.byChannel) {
        Object.keys(day.byChannel).forEach((ch) => allChannels.add(ch));
      }
    }
    const channelNames = Array.from(allChannels).sort();
    const chartData = (timeline.data as any[]).map((day: any) => {
      const row: any = {
        date: new Date(day.date + "T00:00:00").toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      };
      for (const ch of channelNames) {
        row[ch] = day.byChannel?.[ch] ?? 0;
      }
      return row;
    });
    return { chartData, channelNames };
  }, [timeline.data]);

  /* Format event breakdown for pie chart */
  const pieData = useMemo(() => {
    if (!summary.data?.eventsByType) return [];
    return Object.entries(summary.data.eventsByType as Record<string, number>)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => ({
        name: type.replace(/_/g, " "),
        value: count,
      }));
  }, [summary.data]);

  /* Format skill invocations for bar chart */
  const skillBarData = useMemo(() => {
    if (!timeline.data) return [];
    return (timeline.data as any[])
      .filter((d: any) => d.skills > 0)
      .map((day: any) => ({
        date: new Date(day.date + "T00:00:00").toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        skills: day.skills,
      }));
  }, [timeline.data]);

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div>
        <h2 className="text-lg font-semibold">Usage Analytics</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Track message volume, channel activity, provider usage, and system events over time.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<MessageSquare className="w-4 h-4 text-cyan" />}
          label="Total Messages"
          value={summary.isLoading ? null : summary.data?.totalMessages ?? 0}
          subtitle="Last 30 days"
        />
        <MetricCard
          icon={<Zap className="w-4 h-4 text-amber" />}
          label="Total Events"
          value={summary.isLoading ? null : summary.data?.totalEvents ?? 0}
          subtitle="Last 30 days"
        />
        <MetricCard
          icon={<AlertTriangle className="w-4 h-4 text-orange-400" />}
          label="Failovers"
          value={
            summary.isLoading
              ? null
              : (summary.data?.eventsByType as Record<string, number>)
                  ?.failover_triggered ?? 0
          }
          subtitle="Provider switches"
        />
        <MetricCard
          icon={<Radio className="w-4 h-4 text-emerald" />}
          label="Channel Events"
          value={
            summary.isLoading
              ? null
              : ((summary.data?.eventsByType as Record<string, number>)
                  ?.channel_connected ?? 0) +
                ((summary.data?.eventsByType as Record<string, number>)
                  ?.channel_disconnected ?? 0)
          }
          subtitle="Connections"
        />
      </div>

      {/* ═══ Area Chart: 14-Day Activity Timeline ═══ */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" />
            14-Day Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.isLoading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.cyan} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={CHART_COLORS.cyan} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradAmber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.amber} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={CHART_COLORS.amber} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradOrange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.orange} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={CHART_COLORS.orange} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.4 0 0 / 0.15)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "oklch(0.6 0 0)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "oklch(0.6 0 0)" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <RechartsTooltip content={<ChartTooltip />} />
                <RechartsLegend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                <Area type="monotone" dataKey="messages" stroke={CHART_COLORS.cyan} fill="url(#gradCyan)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="skills" stroke={CHART_COLORS.amber} fill="url(#gradAmber)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="failovers" stroke={CHART_COLORS.orange} fill="url(#gradOrange)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <BarChart3 className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No activity data yet</p>
              <p className="text-xs mt-1">Start chatting with your agent to see analytics here.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ Per-Channel Message Breakdown (Stacked Bar Chart) ═══ */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Radio className="w-3.5 h-3.5" />
            Messages by Channel
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.isLoading ? (
            <Skeleton className="h-48 w-full rounded-lg" />
          ) : channelBreakdownData.channelNames.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={channelBreakdownData.chartData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.4 0 0 / 0.15)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "oklch(0.6 0 0)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "oklch(0.6 0 0)" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <RechartsTooltip content={<ChartTooltip />} />
                <RechartsLegend wrapperStyle={{ fontSize: 10 }} />
                {channelBreakdownData.channelNames.map((channel) => (
                  <Bar
                    key={channel}
                    dataKey={channel}
                    stackId="channels"
                    fill={CHANNEL_COLORS[channel] ?? "#6b7280"}
                    radius={[0, 0, 0, 0]}
                    maxBarSize={28}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Radio className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No per-channel data yet</p>
              <p className="text-[10px] mt-1">Channel breakdown appears when messages include channel metadata.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ Two-column: Skill Bar Chart + Event Pie Chart ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Skill Invocations */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" />
              Skill Invocations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeline.isLoading ? (
              <Skeleton className="h-48 w-full rounded-lg" />
            ) : skillBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={skillBarData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.4 0 0 / 0.15)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "oklch(0.6 0 0)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "oklch(0.6 0 0)" }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip content={<ChartTooltip />} />
                  <Bar dataKey="skills" fill={CHART_COLORS.amber} radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Zap className="w-6 h-6 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No skill invocations recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie/Donut Chart: Event Type Distribution */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <PieChartIcon className="w-3.5 h-3.5" />
              Event Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.isLoading ? (
              <Skeleton className="h-48 w-full rounded-lg" />
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<PieTooltip />} />
                  <RechartsLegend
                    wrapperStyle={{ fontSize: 10 }}
                    formatter={(value: string) => (
                      <span className="text-[10px] capitalize text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <PieChartIcon className="w-6 h-6 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No events recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>


    </div>
  );
}

/* ─── Sub-components ─── */

function MetricCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  subtitle: string;
}) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            {value === null ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold mt-1">{value}</p>
            )}
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {subtitle}
            </p>
          </div>
          <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
