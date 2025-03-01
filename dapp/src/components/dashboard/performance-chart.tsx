import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeRange } from "@/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mock data for the chart
const generateChartData = (days: number, volatility: number = 0.5, trend: number = 0.2) => {
  const data = [];
  let value = 100;
  
  for (let i = 0; i < days; i++) {
    // Add some randomness with a slight upward trend
    const change = (Math.random() - 0.5) * volatility + trend;
    value = value * (1 + change / 100);
    
    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      value: parseFloat(value.toFixed(2)),
    });
  }
  
  return data;
};

const chartData = {
  '1D': generateChartData(24, 0.8, 0.05),
  '1W': generateChartData(7, 1.2, 0.1),
  '1M': generateChartData(30, 1.5, 0.15),
  '3M': generateChartData(90, 2, 0.2),
  '1Y': generateChartData(365, 3, 0.25),
  'ALL': generateChartData(730, 4, 0.3),
};

interface PerformanceChartProps {
  title?: string;
  description?: string;
  className?: string;
}

export function PerformanceChart({ 
  title = "Performance", 
  description = "Track your vault performance over time",
  className 
}: PerformanceChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="1M">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="1D">1D</TabsTrigger>
            <TabsTrigger value="1W">1W</TabsTrigger>
            <TabsTrigger value="1M">1M</TabsTrigger>
            <TabsTrigger value="3M">3M</TabsTrigger>
            <TabsTrigger value="1Y">1Y</TabsTrigger>
            <TabsTrigger value="ALL">ALL</TabsTrigger>
          </TabsList>
          {(Object.keys(chartData) as TimeRange[]).map((timeRange) => (
            <TabsContent key={timeRange} value={timeRange} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData[timeRange]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)'
                    }}
                    formatter={(value) => [`$${value}`, 'Value']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}