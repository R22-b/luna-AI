function detectTaskType(message) {
  const lower = message.toLowerCase();

  // PC CONTROL (Check this first)
  if (/volume (up|down|max|mute)|brightness|open (settings|browser|chrome|notepad|calculator|cmd|powershell|spotify|app)|close (app|browser)|shutdown|restart|sleep|lock|minimize|maximize|take (a )?screenshot|check.*(exist|there)|what is/i.test(lower)) {
    return 'pc_control';
  }
  if (/(?:play|search).*(?:in|on)\s*(?:youtube|yt)|(?:youtube|yt).*(?:play|search)/i.test(lower)) {
    return 'pc_control';
  }
  if (/(create|make|write).*(file|document)/.test(lower) && !/(word|ppt|powerpoint|excel|pdf)/.test(lower)) {
    return 'pc_control';
  }
  if (/find (file|files)|search (for )?file|locate/.test(lower)) {
    return 'pc_control';
  }

  // AUTONOMOUS SCRIPT (Block 17)
  if (/run autonomously|do this for me|write a script to/i.test(lower)) {
    return 'autonomous_script';
  }

  // STUDENT TOOLS (Block 26)
  if (/feynman|explain.*like.*10|analog/i.test(lower) || /recall|quiz|test me/i.test(lower)) {
    return 'student';
  }

  // CODE EXECUTION
  if (/(write|create|make).*(code|script|function|app|html|python|javascript|css)/.test(lower) && !/project|plugin/.test(lower)) {
    return 'code';
  }

  // SPOTIFY CONTROL
  if (/(play|pause|stop|next|skip|previous|back).*(music|song|spotify)/i.test(lower)) {
    return 'spotify';
  }

  // THEME CONTROL
  if (/(change|set|update|switch).*(theme|color|ui|look|design|mode)/i.test(lower)) {
    return 'theme';
  }

  // PLUGIN BUILD
  if (/(build|create|make).*(plugin|extension)/i.test(lower)) {
    return 'plugin_build';
  }

  // MEDIA GENERATION
  if (/generate|create|make|draw|show/i.test(lower) && /image|picture|art|photo|logo/i.test(lower)) {
    return 'image_gen';
  }
  if (/generate|create|make|show/i.test(lower) && /video|animation/i.test(lower)) {
    return 'video_gen';
  }

  // DOCUMENT CREATION
  if (/generate|create|make|write/i.test(lower) && /doc|word|pdf|ppt|powerpoint|presentation|excel|spreadsheet/i.test(lower)) {
    return 'doc_create';
  }

  // PROJECT ROLLBACK
  if (/(rollback|restore|revert|undo).*(backup|project|build)/i.test(lower)) {
    return 'rollback';
  }
  if (/(list|show|view).*(backup|backups)/i.test(lower)) {
    return 'rollback';
  }

  // PROJECT BUILD
  if (/build|create|make|generate/i.test(lower) && /project|website|app|game|calculator|clone/i.test(lower)) {
    return 'project_build';
  }

  // PROJECT UPDATE/MODIFY
  if (/(update|modify|fix|edit|add to|improve)\s+([^\s]+)/i.test(lower)) {
    return 'project_build'; // Route updates to project builder
  }

  // PDF READING
  if (/.pdf|read.*pdf/i.test(lower)) {
    return 'pdf_read';
  }

  // LINK SUMMARIZATION
  if (/(https?:\/\/[^\s]+)/i.test(lower)) {
    return 'summarize_link';
  }

  // RESEARCH
  if (/search|research|find out|what is the latest|who is|what is/i.test(lower)) {
    // Check if it's a casual chat question vs real research
    if (lower.split(' ').length > 3 && !/how are you|who are you|what are you doing/.test(lower)) {
      return 'research';
    }
  }

  // FALLBACK
  return 'chat';
}

function mapTaskType(taskType) {
  const map = {
    chat: 'chat',
    pc_control: 'chat',
    project_build: 'code',
    pdf_read: 'summarize',
    doc_create: 'creative',
    image_gen: 'creative',
    video_gen: 'creative',
    research: 'research',
    student: 'summarize',
    code: 'code',
    summarize: 'summarize',
    creative: 'creative',
    reasoning: 'reasoning',
  };
  return map[taskType] || 'chat';
}

module.exports = {
  detectTaskType,
  mapTaskType
};
