import { getAllReservations } from "./reservationService";
import { startOfWeek, parseISO } from "date-fns";

export async function getBlockedDates() {
  const all = (await getAllReservations()).filter(
    (r) => r.status === "" || r.status === "Confirmed"
  );

  const dailyStartCounts = {};
  const weeklyStartCounts = {};
  const dailyEndCounts = {};

  for (let r of all) {
    const start = r.startDate;
    const end = r.endDate;
    const weekStart = startOfWeek(parseISO(start), { weekStartsOn: 1 })
      .toISOString()
      .split("T")[0];

    dailyStartCounts[start] = (dailyStartCounts[start] || 0) + 1;
    weeklyStartCounts[weekStart] = (weeklyStartCounts[weekStart] || 0) + 1;
    dailyEndCounts[end] = (dailyEndCounts[end] || 0) + 1;
  }

  const blockedStarts = Object.keys(dailyStartCounts).filter(
    (date) => dailyStartCounts[date] >= 3
  );
  const blockedWeeks = Object.keys(weeklyStartCounts).filter(
    (week) => weeklyStartCounts[week] >= 15
  );
  const blockedEnds = Object.keys(dailyEndCounts).filter(
    (date) => dailyEndCounts[date] >= 3
  );

  return { blockedStarts, blockedWeeks, blockedEnds };
}
