"use client";

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/app/context/SessionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

interface SensorData {
  steps: number;
  distance: number;
  calories: number;
  activityType: string;
}

interface DeviceMotionEventWithPermission extends DeviceMotionEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

export function FitnessTracker() {
  const { user } = useSession();
  const [isMobile, setIsMobile] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData>({
    steps: 0,
    distance: 0,
    calories: 0,
    activityType: 'idle'
  });

  const saveFitnessData = useCallback(async (data: SensorData) => {
    try {
      const response = await fetch('/api/fitness/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          userId: user?.id,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save fitness data');
      }
    } catch (error) {
      console.error('Error saving fitness data:', error);
    }
  }, [user?.id]);

  // Check if device is mobile and has required sensors
  useEffect(() => {
    const checkDevice = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };

    checkDevice();
  }, []);

  // Request sensor permissions and initialize tracking
  useEffect(() => {
    if (!isTracking || !isMobile) return;

    const stepCounter = 0;
    let lastAcceleration = { x: 0, y: 0, z: 0 };
    let stepCount = 0;

    const initializeSensors = async () => {
      try {
        // Request permission for sensors
        const DeviceMotionEvent = window.DeviceMotionEvent as unknown as DeviceMotionEventWithPermission;
        if (DeviceMotionEvent?.requestPermission) {
          const permission = await DeviceMotionEvent.requestPermission();
          if (permission !== 'granted') {
            throw new Error('Sensor permission denied');
          }
        }

        // Initialize step detection
        window.addEventListener('devicemotion', handleMotion);
      } catch (error) {
        console.error('Error initializing sensors:', error);
        setIsTracking(false);
      }
    };

    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration?.x || !acceleration?.y || !acceleration?.z) return;

      // Simple step detection algorithm
      const magnitude = Math.sqrt(
        Math.pow(acceleration.x - lastAcceleration.x, 2) +
        Math.pow(acceleration.y - lastAcceleration.y, 2) +
        Math.pow(acceleration.z - lastAcceleration.z, 2)
      );

      if (magnitude > 10) { // Threshold for step detection
        stepCount++;
        
        // Calculate approximate distance and calories
        const strideLength = 0.7; // Average stride length in meters
        const distance = stepCount * strideLength;
        const calories = stepCount * 0.04; // Rough estimate of calories per step

        const newSensorData = {
          steps: stepCount,
          distance: parseFloat(distance.toFixed(2)),
          calories: Math.round(calories),
          activityType: magnitude > 15 ? 'running' : 'walking'
        };

        setSensorData(newSensorData);

        // Save data every 100 steps
        if (stepCount % 100 === 0) {
          saveFitnessData(newSensorData);
        }
      }

      lastAcceleration = {
        x: acceleration.x,
        y: acceleration.y,
        z: acceleration.z
      };
    };

    initializeSensors();

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      // Save final data when component unmounts or tracking stops
      if (sensorData.steps > 0) {
        saveFitnessData(sensorData);
      }
    };
  }, [isTracking, isMobile, saveFitnessData, sensorData]);

  if (!isMobile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mobile Device Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please use a mobile device to access the fitness tracking features.
            You can still view your fitness data on this device.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fitness Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={() => setIsTracking(!isTracking)}
            className="w-full"
          >
            {isTracking ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Stop Tracking
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Tracking
              </>
            )}
          </Button>

          {isTracking && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Steps</p>
                <p className="text-2xl font-bold">{sensorData.steps}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Distance</p>
                <p className="text-2xl font-bold">{sensorData.distance}m</p>
              </div>
              <div>
                <p className="text-sm font-medium">Calories</p>
                <p className="text-2xl font-bold">{sensorData.calories}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Activity</p>
                <p className="text-2xl font-bold capitalize">{sensorData.activityType}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 