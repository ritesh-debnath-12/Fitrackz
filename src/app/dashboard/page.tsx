"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Heart, Flame, Droplet } from 'lucide-react'
import { FitnessTracker } from "@/components/fitness-tracker"
import { ActivityCharts } from "@/components/activity-charts"

interface FitnessData {
  steps: number;
  distance: number;
  calories: number;
  activities: Record<string, number>;
  activityType: string;
}

export default function Dashboard() {
  const [fitnessData, setFitnessData] = useState<FitnessData>({
    steps: 0,
    distance: 0,
    calories: 0,
    activities: {},
    activityType: 'walking'
  });

  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    let isMounted = true;

    const fetchFitnessData = async () => {
      try {
        const response = await fetch('/api/fitness/track');
        if (response.ok && isMounted) {
          const data = await response.json();
          setFitnessData(data);
        }
      } catch (error) {
        console.error('Error fetching fitness data:', error);
      }
    };

    // Fetch immediately
    fetchFitnessData();

    // Then fetch every 2 seconds
    const interval = setInterval(fetchFitnessData, 2000);

    // Cleanup function
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Fitness Dashboard</h1>
        <Tabs 
          defaultValue="daily" 
          className="space-y-4"
          value={timeframe}
          onValueChange={(value) => setTimeframe(value as 'daily' | 'weekly' | 'monthly')}
        >
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                icon={Activity}
                title="Steps"
                value={fitnessData.steps.toString()}
                goal="10,000"
                unit="steps"
              />
              <MetricCard
                icon={Heart}
                title="Distance"
                value={fitnessData.distance.toFixed(2)}
                unit="m"
              />
              <MetricCard
                icon={Flame}
                title="Calories Burned"
                value={fitnessData.calories.toString()}
                goal="2,200"
                unit="cal"
              />
              <MetricCard
                icon={Droplet}
                title="Activity Types"
                value={Object.keys(fitnessData.activities).join(', ') || 'None'}
                unit=""
              />
            </div>

            <div className="space-y-4">
              <FitnessTracker />
              <ActivityCharts data={fitnessData} timeframe={timeframe} />
            </div>
          </TabsContent>
          <TabsContent value="weekly" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                icon={Activity}
                title="Weekly Steps"
                value={(fitnessData.steps * 7).toString()}
                goal="70,000"
                unit="steps"
              />
              <MetricCard
                icon={Heart}
                title="Weekly Distance"
                value={(fitnessData.distance * 7).toFixed(2)}
                unit="m"
              />
              <MetricCard
                icon={Flame}
                title="Weekly Calories"
                value={(fitnessData.calories * 7).toString()}
                goal="15,400"
                unit="cal"
              />
              <MetricCard
                icon={Droplet}
                title="Activity Types"
                value={Object.keys(fitnessData.activities).join(', ') || 'None'}
                unit=""
              />
            </div>
            <ActivityCharts data={{
              ...fitnessData,
              steps: fitnessData.steps * 7,
              distance: fitnessData.distance * 7,
              calories: fitnessData.calories * 7,
            }} timeframe={timeframe} />
          </TabsContent>
          <TabsContent value="monthly" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                icon={Activity}
                title="Monthly Steps"
                value={(fitnessData.steps * 30).toString()}
                goal="300,000"
                unit="steps"
              />
              <MetricCard
                icon={Heart}
                title="Monthly Distance"
                value={(fitnessData.distance * 30).toFixed(2)}
                unit="m"
              />
              <MetricCard
                icon={Flame}
                title="Monthly Calories"
                value={(fitnessData.calories * 30).toString()}
                goal="66,000"
                unit="cal"
              />
              <MetricCard
                icon={Droplet}
                title="Activity Types"
                value={Object.keys(fitnessData.activities).join(', ') || 'None'}
                unit=""
              />
            </div>
            <ActivityCharts data={{
              ...fitnessData,
              steps: fitnessData.steps * 30,
              distance: fitnessData.distance * 30,
              calories: fitnessData.calories * 30,
            }} timeframe={timeframe} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function MetricCard({ icon: Icon, title, value, goal, unit }: { 
  icon: React.ElementType, 
  title: string, 
  value: string, 
  goal?: string, 
  unit: string 
}) {
  const progress = goal ? (parseFloat(value) / parseFloat(goal)) * 100 : 100

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value} {unit && <span className="text-sm font-normal text-muted-foreground">{unit}</span>}</div>
        {goal && (
          <Progress
            value={progress}
            className="mt-2"
          />
        )}
        {goal && (
          <p className="text-xs text-muted-foreground mt-1">Goal: {goal} {unit}</p>
        )}
      </CardContent>
    </Card>
  )
}

