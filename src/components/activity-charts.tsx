"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from 'react';

interface ActivityChartsProps {
  data: {
    steps: number;
    distance: number;
    calories: number;
    activityType: string;
  };
  timeframe: 'daily' | 'weekly' | 'monthly';
}

type ChartDataItem = {
  name: string;
  value: number;
  fill: string;
  actual?: number;
  goal?: number;
};

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export function ActivityCharts({ data, timeframe }: ActivityChartsProps) {
  const [activityDistribution, setActivityDistribution] = useState([
    { name: 'Walking', value: 1, fill: COLORS[0] },
    { name: 'Running', value: 0, fill: COLORS[1] }
  ]);

  useEffect(() => {
    setActivityDistribution([
      { name: 'Walking', value: data.activityType === 'walking' ? 1 : 0, fill: COLORS[0] },
      { name: 'Running', value: data.activityType === 'running' ? 1 : 0, fill: COLORS[1] }
    ]);
  }, [data.activityType]);

  // Calculate percentages based on goals
  const dailyGoals = {
    steps: 10000,
    distance: 8000, // meters instead of km
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
      actual: data.steps,
      goal: goals.steps
    },
    {
      name: 'Distance',
      value: Math.min((data.distance / goals.distance) * 100, 100),
      fill: COLORS[1],
      actual: data.distance,
      goal: goals.distance
    },
    {
      name: 'Calories',
      value: Math.min((data.calories / goals.calories) * 100, 100),
      fill: COLORS[2],
      actual: data.calories,
      goal: goals.calories
    },
  ].map(item => ({
    ...item,
    value: Number(item.value.toFixed(1)) // Round to 1 decimal place
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] relative">
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
                background
                dataKey="value"
                cornerRadius={15}
              />
              <Legend
                iconSize={10}
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{
                  fontSize: '12px',
                  paddingLeft: '10px',
                  width: '140px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                formatter={(value, entry) => {
                  const payload = (entry.payload as unknown) as ChartDataItem;
                  return payload.actual !== undefined && payload.goal !== undefined
                    ? `${payload.name}: ${payload.actual}/${payload.goal}`
                    : value;
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Activity: {data.activityType}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activityDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                labelLine={false}
                animationDuration={300}
              >
                {activityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => {
                  const payload = (entry.payload as unknown) as ChartDataItem;
                  return `${value} ${payload.value === 1 ? '(Active)' : ''}`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
} 