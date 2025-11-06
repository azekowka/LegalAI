"use client";

import { formatISO, parseISO } from "date-fns";

export type Activity = {
  date: string;
  count: number;
  level: number;
};

const ACTIVITY_STORAGE_KEY = "user_activity";

// The levels are just an example, they can be adjusted.
const MAX_LEVEL = 4;
const COUNTS_FOR_LEVELS = [0, 1, 3, 5, 8]; // e.g. 0 count -> level 0, 1-2 counts -> level 1, 3-4 -> level 2, etc.

function getLevel(count: number): number {
  for (let i = COUNTS_FOR_LEVELS.length - 1; i >= 0; i--) {
    if (count >= COUNTS_FOR_LEVELS[i]) {
      return Math.min(i, MAX_LEVEL);
    }
  }
  return 0;
}

export function recordActivity() {
  const today = formatISO(new Date(), { representation: "date" });
  const activities = getActivities();

  const todayActivity = activities.find((a) => a.date === today);

  if (todayActivity) {
    todayActivity.count += 1;
    todayActivity.level = getLevel(todayActivity.count);
  } else {
    activities.push({
      date: today,
      count: 1,
      level: 1,
    });
  }

  saveActivities(activities);
}

export function getActivities(): Activity[] {
  try {
    const storedActivities = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (storedActivities) {
      return JSON.parse(storedActivities);
    }
  } catch (error) {
    console.error("Failed to read activities from localStorage", error);
  }
  return [];
}

function saveActivities(activities: Activity[]) {
  try {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities));
  } catch (error) {
    console.error("Failed to save activities to localStorage", error);
  }
}

