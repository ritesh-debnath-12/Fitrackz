"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityChartsProps {
  data: {
    steps: number;
    distance: number;
    calories: number;
    activityType: string;
  };
  timeframe: 'daily' | 'weekly' | 'monthly';
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export function ActivityCharts({ data, timeframe }: ActivityChartsProps) {
  // Calculate percentages based on goals
  const dailyGoals = {
    steps: 10000,
    distance: 8, // km
    calories: 2200,
  };

  const multiplier = timeframe === 'weekly' ? 7 : timeframe === 'monthly' ? 30 : 1;
  const goals = {
    steps: dailyGoals.steps * multiplier,
    distance: dailyGoals.distance * multiplier,
    calories: dailyGoals.calories * multiplier,
  };

  const progressData = [
    {
      name: 'Steps',
      value: Math.min((data.steps / goals.steps) * 100, 100),
      fill: COLORS[0],
    },
    {
      name: 'Distance',
      value: Math.min((data.distance / goals.distance) * 100, 100),
      fill: COLORS[1],
    },
    {
      name: 'Calories',
      value: Math.min((data.calories / goals.calories) * 100, 100),
      fill: COLORS[2],
    },
  ];

  const activityDistribution = [
    { name: 'Walking', value: data.activityType === 'walking' ? 1 : 0 },
    { name: 'Running', value: data.activityType === 'running' ? 1 : 0 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="30%"
              outerRadius="80%"
              data={progressData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                label={{ position: 'insideStart', fill: '#fff' }}
                background
                dataKey="value"
              />
              <Legend
                iconSize={10}
                layout="vertical"
                verticalAlign="middle"
                align="right"
              />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activityDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => value ? name : ''}
              >
                {activityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
} 