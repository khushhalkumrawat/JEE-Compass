const StudyActivity = require("../models/StudyActivity");

function getDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

async function recordStudyActivity(studentId) {
  const today = getDateKey();

  return StudyActivity.findOneAndUpdate(
    { studentId },
    {
      $addToSet: { activeDates: today },
      $setOnInsert: { studentId },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    },
  );
}

function calculateStreak(activeDates = []) {
  const dates = new Set(activeDates);
  const today = getDateKey();

  const yesterdayDate = new Date(`${today}T00:00:00.000Z`);
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);

  const yesterday = yesterdayDate.toISOString().slice(0, 10);

  let currentDate = dates.has(today)
    ? today
    : yesterday;

  let streak = 0;

  while (dates.has(currentDate)) {
    streak++;

    const previousDate = new Date(`${currentDate}T00:00:00.000Z`);
    previousDate.setUTCDate(previousDate.getUTCDate() - 1);

    currentDate = previousDate.toISOString().slice(0, 10);
  }

  return streak;
}

module.exports = {
  getDateKey,
  recordStudyActivity,
  calculateStreak,
};