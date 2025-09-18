"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAnalyticsCharts } from "@/lib/api/admin/dashboard";
import { useAuthStore } from "@/store/authStore";
import {
  TimeRange,
  AnalyticsDto,
  ChartDataItemDto,
} from "@/types/admin/dashboard.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Activity,
  Users,
  MessageCircle,
  Video,
  FileText,
  RefreshCw,
  Download,
  FileDown,
  Loader2,
} from "lucide-react";
import {
  exportElementToPdf,
  exportElementToPdfSimple,
} from "@/lib/utils/pdfExporter";
import { toast } from "sonner";
import Link from "next/link";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader } from "@/components/shared/AdminPageHeader";
import { formatUtcToIctDate } from "@/lib/dateUtils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

// Chart color schemes
const CHART_COLORS = {
  primary: "#8b5cf6",
  secondary: "#06b6d4",
  accent: "#f59e0b",
  success: "#10b981",
  warning: "#f97316",
  danger: "#ef4444",
};

const TIME_RANGE_OPTIONS: {
  value: TimeRange;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    value: "Last7Days",
    label: "7 ngày",
    icon: Calendar,
    description: "Xu hướng ngắn hạn",
  },
  {
    value: "Last30Days",
    label: "30 ngày",
    icon: Calendar,
    description: "Xu hướng trung hạn",
  },
  {
    value: "Last6Months",
    label: "6 tháng",
    icon: Calendar,
    description: "Xu hướng dài hạn",
  },
  {
    value: "Last12Months",
    label: "12 tháng",
    icon: Calendar,
    description: "Xu hướng năm",
  },
];

// Enhanced Chart Components
const ChartCard = ({
  title,
  subtitle,
  icon: Icon,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) => (
  <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50 overflow-hidden">
    <CardHeader className="bg-gradient-to-r from-muted/20 to-transparent border-b border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </CardHeader>
    <CardContent className="p-6">{children}</CardContent>
  </Card>
);

export default function AdminAnalyticsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [timeRange, setTimeRange] = useState<TimeRange>("Last30Days");
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      // Generate a dynamic filename with current date and time range
      const fileName = `Analytics_Report_${timeRange}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;

      // Try the main export function first
      try {
        await exportElementToPdf("analytics-export-area", fileName);
        toast.success("Xuất PDF thành công", {
          description: "Báo cáo analytics đã được tải xuống.",
        });
      } catch (mainError) {
        console.warn(
          "Main export failed, trying simplified version:",
          mainError
        );

        // Fallback to simplified export
        await exportElementToPdfSimple("analytics-export-area", fileName);
        toast.success("Xuất PDF thành công (chế độ đơn giản)", {
          description:
            "Báo cáo analytics đã được tải xuống với định dạng đơn giản.",
        });
      }
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error("Lỗi khi xuất PDF", {
        description: "Vui lòng thử lại sau hoặc liên hệ hỗ trợ.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["analytics-charts", timeRange],
    queryFn: async () => {
      const response = await getAnalyticsCharts(timeRange);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch analytics data");
      }
      return response.data;
    },
    retry: 2,
    retryDelay: 1000,
    enabled: isAuthenticated && user?.roles?.includes("Admin"),
  });

  const formatChartDate = (dateString: string, timeRange: TimeRange) => {
    const date = formatUtcToIctDate(dateString);
    if (timeRange === "Last7Days" || timeRange === "Last30Days") {
      return date.split("/").slice(0, 2).join("/");
    } else {
      return date.split("/").slice(1).join("/");
    }
  };

  const renderTimeSeriesChart = (
    title: string,
    data: AnalyticsDto["userGrowthChartData"],
    dataKey: keyof ChartDataItemDto,
    color: string,
    icon: React.ComponentType<{ className?: string }>
  ) => {
    const chartData =
      data?.map((item) => ({
        ...item,
        formattedDate: formatChartDate(item.date, timeRange),
      })) || [];

    const totalValue = chartData.reduce(
      (sum, item) => sum + (Number(item[dataKey]) || 0),
      0
    );
    const avgValue =
      chartData.length > 0 ? Math.round(totalValue / chartData.length) : 0;

    return (
      <ChartCard
        title={title}
        subtitle={`Tổng: ${totalValue.toLocaleString()} • Trung bình: ${avgValue.toLocaleString()}`}
        icon={icon}
        actions={
          <Badge variant="secondary" className="bg-background/50">
            {chartData.length} điểm dữ liệu
          </Badge>
        }
      >
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12, fill: "currentColor" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "currentColor" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                domain={["dataMin - 1", "dataMax + 2"]}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card/95 backdrop-blur border border-border rounded-lg shadow-xl p-4">
                        <p className="text-sm font-semibold text-foreground mb-2">
                          📅 {label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Số lượng:{" "}
                          <span className="font-medium text-foreground">
                            {payload[0].value?.toLocaleString()}
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={3}
                dot={{ fill: color, strokeWidth: 2, r: 5 }}
                activeDot={{
                  r: 7,
                  fill: color,
                  stroke: "#ffffff",
                  strokeWidth: 3,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    );
  };

  const renderPieChart = (
    title: string,
    data: AnalyticsDto["classificationCharts"]["userRoleDistribution"],
    colors: string[],
    icon: React.ComponentType<{ className?: string }>
  ) => {
    if (!data || data.length === 0) {
      return (
        <ChartCard title={title} icon={icon}>
          <div className="h-[320px] w-full flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto">
                <PieChart className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium">
                Không có dữ liệu
              </p>
              <p className="text-sm text-muted-foreground/70">
                Dữ liệu sẽ xuất hiện khi có hoạt động
              </p>
            </div>
          </div>
        </ChartCard>
      );
    }

    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    return (
      <ChartCard
        title={title}
        subtitle={`Tổng: ${totalValue.toLocaleString()} mục`}
        icon={icon}
        actions={
          <Badge variant="secondary" className="bg-background/50">
            {data.length} loại
          </Badge>
        }
      >
        <div className="flex items-center justify-center h-[320px] w-full">
          <div className="flex-1 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={30}
                  dataKey="value"
                  label={({ label, percent }) =>
                    `${((percent ?? 0) * 100).toFixed(1)}%`
                  }
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const percent = ((data.value / totalValue) * 100).toFixed(
                        1
                      );
                      return (
                        <div className="bg-card/95 backdrop-blur border border-border rounded-lg shadow-xl p-4">
                          <p className="text-sm font-semibold text-foreground mb-2">
                            {data.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Số lượng:{" "}
                            <span className="font-medium text-foreground">
                              {data.value.toLocaleString()}
                            </span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Tỷ lệ:{" "}
                            <span className="font-medium text-foreground">
                              {percent}%
                            </span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Enhanced Legend */}
          <div className="flex-1 pl-6 space-y-3 max-h-[280px] overflow-y-auto">
            {data.map((entry, index) => {
              const percent = ((entry.value / totalValue) * 100).toFixed(1);
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {entry.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.value.toLocaleString()} ({percent}%)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ChartCard>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm" className="hover:bg-accent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại Dashboard
              </Button>
            </Link>
          </div>
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-6">
              <ErrorDisplay
                error={error as Error}
                retry={() => refetch()}
                title="Không thể tải dữ liệu analytics"
                subtitle="Vui lòng thử lại sau"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentRange = TIME_RANGE_OPTIONS.find(
    (opt) => opt.value === timeRange
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="space-y-4">
          <AdminPageHeader
            icon={TrendingUp}
            title="Analytics"
            description="Phân tích chi tiết về hoạt động của nền tảng"
            gradientColors="from-chart-1/10 via-chart-2/10 to-chart-3/10"
            iconClassName="text-chart-1"
          >
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-accent no-export"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isFetching}
                className="bg-background/80 no-export"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
                />
                Làm mới
              </Button>
              <Button
                variant="outline"
                onClick={handleExportPdf}
                disabled={isExporting || isLoading}
                className="bg-background/80 no-export"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4 mr-2" />
                )}
                {isExporting ? "Đang xử lý..." : "Xuất PDF"}
              </Button>
            </div>
          </AdminPageHeader>
        </div>

        {/* Enhanced Time Range Controls */}
        <ChartCard
          title="Chọn khoảng thời gian"
          subtitle={currentRange?.description}
          icon={Calendar}
          actions={
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20"
            >
              <Activity className="h-3 w-3 mr-1" />
              Đang xem: {currentRange?.label}
            </Badge>
          }
        >
          <Tabs
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          >
            <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1">
              {TIME_RANGE_OPTIONS.map((option) => (
                <TabsTrigger
                  key={option.value}
                  value={option.value}
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{option.label}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </ChartCard>

        {isLoading ? (
          <div className="space-y-8">
            {[1, 2].map((section) => (
              <div key={section} className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid gap-6 md:grid-cols-2">
                  {[1, 2].map((i) => (
                    <Card key={i} className="border-0 shadow-sm">
                      <CardHeader>
                        <Skeleton className="h-6 w-[200px]" />
                        <Skeleton className="h-4 w-[300px]" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-[320px] w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          data && (
            <div id="analytics-export-area" className="space-y-8">
              {/* Enhanced Time Series Charts */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-chart-1" />
                  <h2 className="text-2xl font-semibold text-foreground">
                    Biểu đồ tăng trưởng theo thời gian
                  </h2>
                  <Badge
                    variant="secondary"
                    className="bg-chart-1/10 text-chart-1 border-chart-1/20"
                  >
                    Cập nhật real-time
                  </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {renderTimeSeriesChart(
                    "Tăng trưởng người dùng",
                    data.userGrowthChartData,
                    "count",
                    CHART_COLORS.primary,
                    Users
                  )}
                  {renderTimeSeriesChart(
                    "Tăng trưởng nhóm",
                    data.groupGrowthChartData,
                    "count",
                    CHART_COLORS.secondary,
                    MessageCircle
                  )}
                  {renderTimeSeriesChart(
                    "Cuộc gọi video",
                    data.videoCallChartData,
                    "count",
                    CHART_COLORS.accent,
                    Video
                  )}
                  {renderTimeSeriesChart(
                    "Tăng trưởng bài viết",
                    data.postGrowthChartData,
                    "count",
                    CHART_COLORS.success,
                    FileText
                  )}
                </div>
              </div>

              {/* Enhanced Classification Charts */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <PieChart className="h-6 w-6 text-chart-2" />
                  <h2 className="text-2xl font-semibold text-foreground">
                    Biểu đồ phân loại
                  </h2>
                  <Badge
                    variant="secondary"
                    className="bg-chart-2/10 text-chart-2 border-chart-2/20"
                  >
                    Phân tích tỷ lệ
                  </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {renderPieChart(
                    "Phân bố vai trò người dùng",
                    data.classificationCharts.userRoleDistribution,
                    [
                      CHART_COLORS.primary,
                      CHART_COLORS.secondary,
                      CHART_COLORS.accent,
                      CHART_COLORS.success,
                    ],
                    Users
                  )}
                  {renderPieChart(
                    "Phân bố trạng thái người dùng",
                    data.classificationCharts.userStatusDistribution,
                    [
                      CHART_COLORS.success,
                      CHART_COLORS.warning,
                      CHART_COLORS.danger,
                    ],
                    Activity
                  )}
                  {renderPieChart(
                    "Phân bố loại nhóm",
                    data.classificationCharts.groupTypeDistribution,
                    [
                      CHART_COLORS.primary,
                      CHART_COLORS.secondary,
                      CHART_COLORS.accent,
                    ],
                    MessageCircle
                  )}
                  {renderPieChart(
                    "Phân bố trạng thái báo cáo",
                    data.classificationCharts.reportStatusDistribution,
                    [
                      CHART_COLORS.warning,
                      CHART_COLORS.danger,
                      CHART_COLORS.success,
                    ],
                    FileText
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
