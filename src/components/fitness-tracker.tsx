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
  const [sessionData, setSessionData] = useState({
    steps: 0,
    distance: 0,
    calories: 0,
    activityType: "walking"
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

  const handleStopTracking = async () => {
    setIsTracking(false);
    // Only save data if there were steps in this session
    if (sessionData.steps > 0) {
      await saveFitnessData(sessionData);
    }
    // Reset session data for next tracking session
    setSessionData({
      steps: 0,
      distance: 0,
      calories: 0,
      activityType: "walking"
    });
  };

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

    let stepCount = sessionData.steps; // Start from current session steps
    let lastMagnitude = 0;
    const threshold = 10; // Lower threshold for better sensitivity
    
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
        
        // Update activity type based on magnitude
        const newActivityType = magnitude > 15 ? "running" : "walking";
        
        // Calculate distance (rough estimation)
        const strideLength = newActivityType === "running" ? 2.5 : 0.74; // meters
        const newDistance = Number((stepCount * strideLength / 1000).toFixed(2));
        
        // Calculate calories (rough estimation)
        const caloriesPerStep = newActivityType === "running" ? 0.07 : 0.04;
        const newCalories = Number((stepCount * caloriesPerStep).toFixed(2));
        
        // Update session data
        setSessionData({
          steps: stepCount,
          distance: newDistance,
          calories: newCalories,
          activityType: newActivityType
        });
      }
      lastMagnitude = magnitude;
    };

    initializeSensors();

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isTracking, isMobile, sessionData.steps]);

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
            onClick={() => isTracking ? handleStopTracking() : setIsTracking(true)}
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
                <p className="text-2xl font-bold">{sessionData.steps}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Distance</p>
                <p className="text-2xl font-bold">{sessionData.distance}km</p>
              </div>
              <div>
                <p className="text-sm font-medium">Calories</p>
                <p className="text-2xl font-bold">{sessionData.calories}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Activity</p>
                <p className="text-2xl font-bold capitalize">{sessionData.activityType}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 