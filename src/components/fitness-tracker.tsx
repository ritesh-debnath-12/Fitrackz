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
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const [activityType, setActivityType] = useState<string>("walking");
  const [lastSavedSteps, setLastSavedSteps] = useState(0);

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

    let stepCount = 0;
    let lastMagnitude = 0;
    const threshold = 6; // Lower threshold for better sensitivity
    let lastSaveTime = Date.now();
    
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
      if (!isTracking) return;
      
      const { x, y, z } = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
      const magnitude = Math.sqrt((x || 0) ** 2 + (y || 0) ** 2 + (z || 0) ** 2);
      
      if (Math.abs(magnitude - lastMagnitude) > threshold) {
        stepCount++;
        setSteps(stepCount);
        
        // Update activity type based on magnitude
        const newActivityType = magnitude > 15 ? "running" : "walking";
        setActivityType(newActivityType);
        
        // Calculate distance (rough estimation)
        const strideLength = newActivityType === "running" ? 2.5 : 0.74; // meters
        const newDistance = Number((stepCount * strideLength / 1000).toFixed(2));
        setDistance(newDistance);
        
        // Calculate calories (rough estimation)
        const caloriesPerStep = newActivityType === "running" ? 0.07 : 0.04;
        const newCalories = Number((stepCount * caloriesPerStep).toFixed(2));
        setCalories(newCalories);
        
        // Save data every 2 seconds if there are new steps
        const currentTime = Date.now();
        if (currentTime - lastSaveTime >= 2000 && stepCount !== lastSavedSteps) {
          saveFitnessData({
            steps: stepCount,
            distance: newDistance,
            calories: newCalories,
            activityType: newActivityType
          });
          setLastSavedSteps(stepCount);
          lastSaveTime = currentTime;
        }
      }
      lastMagnitude = magnitude;
    };

    initializeSensors();

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      // Save final data when component unmounts or tracking stops
      if (steps > 0) {
        saveFitnessData({
          steps: steps,
          distance: distance,
          calories: calories,
          activityType: activityType
        });
      }
    };
  }, [isTracking, isMobile, saveFitnessData, steps, distance, calories, activityType, lastSavedSteps]);

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
                <p className="text-2xl font-bold">{steps}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Distance</p>
                <p className="text-2xl font-bold">{distance}km</p>
              </div>
              <div>
                <p className="text-sm font-medium">Calories</p>
                <p className="text-2xl font-bold">{calories}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Activity</p>
                <p className="text-2xl font-bold capitalize">{activityType}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 