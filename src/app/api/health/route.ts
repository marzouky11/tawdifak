import { NextResponse } from 'next/server';

// Lightweight health-check endpoint. Point any external uptime monitor
// (UptimeRobot, Better Uptime, Pingdom, etc.) at /api/health so the team
// gets an alert automatically if the site goes down after the launch.
export async function GET() {
  return NextResponse.json(
    { status: 'ok', timestamp: new Date().toISOString() },
    { status: 200 }
  );
}
