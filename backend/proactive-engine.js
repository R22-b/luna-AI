// ============================================
// 🌙 LUNA AI — Proactive Engine
// Scheduled intelligence: briefings, reminders
// ============================================

const schedule = require('node-schedule');
const memory = require('./memory');

const jobs = {};

function startProactiveEngine(nickname = 'baddy', mainWindow = null) {
  // Morning briefing at 8 AM
  jobs.morning = schedule.scheduleJob('0 8 * * *', async () => {
    const goals = memory.getActiveGoals();
    const msg = `yo ${nickname}! good morning ☀️\n\n🎯 you have ${goals.length} active goal${goals.length !== 1 ? 's' : ''}.\nlet's crush it today 🔥`;
    if (mainWindow) mainWindow.webContents.send('luna:notification', { title: 'Good Morning!', body: msg });
    memory.saveConversation('luna', msg, 'neutral', 'proactive');
  });

  // Goal check every 6 hours
  jobs.goalCheck = schedule.scheduleJob('0 */6 * * *', () => {
    const goals = memory.getActiveGoals();
    for (const goal of goals) {
      if (goal.deadline) {
        const hoursLeft = (new Date(goal.deadline) - Date.now()) / 3600000;
        if (hoursLeft < 24 && goal.progress < 50) {
          const msg = `${nickname} wake up! "${goal.title}" deadline is tomorrow and you're only ${goal.progress}% done 👀`;
          if (mainWindow) mainWindow.webContents.send('luna:notification', { title: 'Goal Alert!', body: msg });
          memory.saveConversation('luna', msg, 'neutral', 'proactive');
        }
      }
    }
  });

  // Backup reminder every hour
  jobs.backupReminder = schedule.scheduleJob('0 * * * *', () => {
    try {
      const db = require('./database');
      const stale = db.prepare(`SELECT * FROM watched_projects WHERE is_watching = 1 AND (last_backup IS NULL OR last_backup < datetime('now', '-2 hours'))`).all();
      for (const p of stale) {
        const msg = `${nickname} your ${p.project_name} hasn't been backed up in a while! 👀`;
        if (mainWindow) mainWindow.webContents.send('luna:notification', { title: 'Backup Reminder', body: msg });
      }
    } catch {}
  });

  // Inactivity check every 2 hours (9am-11pm)
  jobs.inactivity = schedule.scheduleJob('0 */2 9-23 * * *', () => {
    const count = memory.getConversationCount();
    const recent = memory.getRecentConversations(1);
    if (recent.length > 0) {
      const lastTime = new Date(recent[0].timestamp);
      const hoursSince = (Date.now() - lastTime.getTime()) / 3600000;
      if (hoursSince > 2) {
        const funMessages = [
          `${nickname} you alive? 👀 haven't heard from you in a while`,
          `${nickname}! quick tech fact: the first computer bug was an actual bug 🐛`,
          `hey ${nickname}, take a break if you need one. but come back. I'm bored 😤`,
        ];
        const msg = funMessages[Math.floor(Math.random() * funMessages.length)];
        if (mainWindow) mainWindow.webContents.send('luna:notification', { title: 'Luna misses you', body: msg });
      }
    }
  });

  console.log('⚡ Proactive engine started');
  return { started: true };
}

function stopProactiveEngine() {
  for (const [name, job] of Object.entries(jobs)) {
    if (job) job.cancel();
    delete jobs[name];
  }
  console.log('⚡ Proactive engine stopped');
}

module.exports = { startProactiveEngine, stopProactiveEngine };
