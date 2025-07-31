#!/usr/bin/env node

/**
 * Progress Update Script for JM Finance Dashboard
 * 
 * Usage:
 *   node scripts/update-progress.js complete "phase1-research"
 *   node scripts/update-progress.js start "phase1-stock-api"
 *   node scripts/update-progress.js list
 */

const fs = require('fs');
const path = require('path');

const PROGRESS_FILE = path.join(__dirname, '../PROGRESS.md');
const ROADMAP_FILE = path.join(__dirname, '../ROADMAP.md');

// Task definitions with emojis and descriptions
const TASKS = {
  'phase1-research': '🔍 Research and select stock price API provider',
  'phase1-stock-api': '📈 Implement stock price fetching service',
  'phase1-crypto-api': '₿ Integrate CoinGecko API for cryptocurrency prices',
  'phase1-forex-api': '💱 Add exchange rates API for currency conversion',
  'phase1-db-setup': '🗄️ Choose and setup database solution',
  'phase1-schema': '📊 Design database schema for portfolios and assets',
  'phase1-migration': '🔄 Migrate from static files to database',
  'phase1-cron': '⏰ Implement cron jobs for regular price updates',
  'phase1-queue': '📝 Create queue system for API rate limiting',
  'phase2-returns': '📊 Build return calculation engine',
  'phase2-risk': '⚠️ Implement risk metrics (Sharpe ratio, beta, volatility)',
  'phase2-rebalance': '⚖️ Create rebalancing engine with drift detection',
  'phase2-charts': '📈 Add advanced charts and visualizations',
  'phase3-auth': '🔐 Implement authentication system',
  'phase3-multi-tenant': '👥 Build multi-tenant architecture',
  'phase3-goals': '🎯 Create goal tracking and financial planning',
  'phase3-reports': '📄 Build PDF report generation and client portal',
  'phase4-optimize': '⚡ Optimize performance with caching',
  'phase4-deploy': '🚀 Setup production deployment with CI/CD'
};

function getCurrentDate() {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function updateProgressFile(taskId, status) {
  const progressContent = fs.readFileSync(PROGRESS_FILE, 'utf8');
  const taskDescription = TASKS[taskId];
  
  if (!taskDescription) {
    console.error(`❌ Unknown task ID: ${taskId}`);
    console.log('Available tasks:');
    Object.keys(TASKS).forEach(id => {
      console.log(`  ${id}: ${TASKS[id]}`);
    });
    return;
  }

  let updatedContent = progressContent;
  const currentDate = getCurrentDate();
  
  if (status === 'complete') {
    // Add to completed section
    const completedSection = '## ✅ COMPLETED MILESTONES';
    const completedIndex = updatedContent.indexOf(completedSection);
    
    if (completedIndex !== -1) {
      const insertPoint = updatedContent.indexOf('\n---', completedIndex);
      const newEntry = `\n- [x] **${taskDescription}** *(Completed ${currentDate})*`;
      updatedContent = updatedContent.slice(0, insertPoint) + newEntry + updatedContent.slice(insertPoint);
    }
    
    // Remove from in progress and upcoming
    updatedContent = updatedContent.replace(new RegExp(`- \\[ \\] .*${taskDescription}.*\n?`, 'g'), '');
    
    console.log(`✅ Marked as complete: ${taskDescription}`);
    
  } else if (status === 'start') {
    // Add to in progress section
    const inProgressSection = '## 🚧 IN PROGRESS';
    const inProgressIndex = updatedContent.indexOf(inProgressSection);
    
    if (inProgressIndex !== -1) {
      const insertPoint = updatedContent.indexOf('\n---', inProgressIndex);
      const newEntry = `\n- [ ] **${taskDescription}** *(Started ${currentDate})*`;
      updatedContent = updatedContent.slice(0, insertPoint) + newEntry + updatedContent.slice(insertPoint);
    }
    
    // Remove "No items currently in progress" message
    updatedContent = updatedContent.replace('*No items currently in progress - ready to start Phase 1*', '');
    
    console.log(`🚧 Marked as in progress: ${taskDescription}`);
  }
  
  // Update last modified date
  updatedContent = updatedContent.replace(
    /\*Last Updated: .*\*/,
    `*Last Updated: ${currentDate}*`
  );
  
  fs.writeFileSync(PROGRESS_FILE, updatedContent);
  console.log(`📝 Updated ${PROGRESS_FILE}`);
}

function listTasks() {
  console.log('📋 Available Tasks:');
  console.log('==================');
  
  Object.entries(TASKS).forEach(([id, description]) => {
    console.log(`${id.padEnd(20)} - ${description}`);
  });
  
  console.log('\n💡 Usage Examples:');
  console.log('  node scripts/update-progress.js complete "phase1-research"');
  console.log('  node scripts/update-progress.js start "phase1-stock-api"');
  console.log('  node scripts/update-progress.js list');
}

function addNote(note) {
  const progressContent = fs.readFileSync(PROGRESS_FILE, 'utf8');
  const currentDate = getCurrentDate();
  
  const notesSection = '## 📝 NOTES & LEARNINGS';
  const notesIndex = progressContent.indexOf(notesSection);
  
  if (notesIndex !== -1) {
    const insertPoint = progressContent.indexOf('### **Business Insights**', notesIndex);
    const newNote = `\n- **${currentDate}**: ${note}`;
    const updatedContent = progressContent.slice(0, insertPoint) + newNote + '\n\n' + progressContent.slice(insertPoint);
    
    fs.writeFileSync(PROGRESS_FILE, updatedContent);
    console.log(`📝 Added note: ${note}`);
  }
}

// Main script logic
const [,, command, taskId, ...noteWords] = process.argv;

switch (command) {
  case 'complete':
    if (!taskId) {
      console.error('❌ Please provide a task ID');
      listTasks();
      process.exit(1);
    }
    updateProgressFile(taskId, 'complete');
    break;
    
  case 'start':
    if (!taskId) {
      console.error('❌ Please provide a task ID');
      listTasks();
      process.exit(1);
    }
    updateProgressFile(taskId, 'start');
    break;
    
  case 'list':
    listTasks();
    break;
    
  case 'note':
    if (!taskId) {
      console.error('❌ Please provide a note');
      console.log('Usage: node scripts/update-progress.js note "Your note here"');
      process.exit(1);
    }
    const note = [taskId, ...noteWords].join(' ');
    addNote(note);
    break;
    
  default:
    console.log('🚀 JM Finance Dashboard - Progress Tracker');
    console.log('==========================================');
    console.log('');
    console.log('Commands:');
    console.log('  complete <task-id>  - Mark a task as completed');
    console.log('  start <task-id>     - Mark a task as in progress');
    console.log('  list               - List all available tasks');
    console.log('  note "message"     - Add a development note');
    console.log('');
    listTasks();
}