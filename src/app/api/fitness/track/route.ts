import { NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getKindeServerSession();
    const isAuthenticated = await session.isAuthenticated();

    if (!isAuthenticated) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await session.getUser();
    const data = await req.json();

    const fitnessData = await prisma.fitnessData.create({
      data: {
        userId: user.id,
        steps: data.steps,
        distance: data.distance,
        calories: data.calories,
        activityType: data.activityType,
        timestamp: new Date(data.timestamp),
      },
    });

    return NextResponse.json(fitnessData);
  } catch (error) {
    console.error('Error saving fitness data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getKindeServerSession();
    const isAuthenticated = await session.isAuthenticated();

    if (!isAuthenticated) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await session.getUser();
    const url = new URL(req.url);
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const fitnessData = await prisma.fitnessData.findMany({
      where: {
        userId: user.id,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Aggregate data for the day
    const aggregatedData = fitnessData.reduce((acc, curr) => ({
      steps: acc.steps + curr.steps,
      distance: acc.distance + curr.distance,
      calories: acc.calories + curr.calories,
      activities: {
        ...acc.activities,
        [curr.activityType]: (acc.activities[curr.activityType] || 0) + 1,
      },
    }), {
      steps: 0,
      distance: 0,
      calories: 0,
      activities: {},
    });

    return NextResponse.json(aggregatedData);
  } catch (error) {
    console.error('Error fetching fitness data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 