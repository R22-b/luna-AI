const path = require('path');
const fs = require('fs');
const axios = require('axios');
const folderManager = require('./folder-manager');
const brain = require('./brain-manager');
const searchEngine = require('./search-engine');
const studentTools = require('./student-tools');

function emitActivity(message, icon = '⚡') {
  try {
    const win = require('./window-manager').getMainWindow();
    if (win && win.webContents) win.webContents.send('luna:activity', { message, icon });
  } catch(e){}
}

async function executeImageGen(message, nickname) {
  try {
    const rawPrompt = message.replace(/^(generate|create|make|draw)\s*(an?|the)?\s*(image|picture|art|photo|logo|poster)\s*(of|about|for|showing)?\s*/i, '').trim();
    if (!rawPrompt) return null;
    const prompt = `${rawPrompt}, ultra-detailed, 4K resolution, cinematic lighting, volumetric atmosphere, professional digital art, vibrant colors, sharp focus, masterpiece quality`;
    emitActivity('generating premium image...', '🎨');

    const nvidiaKey = process.env.NVIDIA_API_KEY || (brain.getKey ? brain.getKey('nvidia_nim') : null);
    if (nvidiaKey) {
      try {
        const res = await axios.post('https://integrate.api.nvidia.com/v1/images/generations', { model: 'nvidia/flux.1-dev', prompt, size: "1024x1024", response_format: 'b64_json' }, { headers: { 'Authorization': `Bearer ${nvidiaKey}` } });
        if (res.data?.data?.[0]?.b64_json) {
          const imgBuffer = Buffer.from(res.data.data[0].b64_json, 'base64');
          const filePath = path.join(folderManager.getAllFolderPaths().images, `luna_art_${Date.now()}.png`);
          fs.writeFileSync(filePath, imgBuffer);
          try { require('child_process').exec(`start "" "${filePath}"`); } catch {}
          return { response: `generated a premium NVIDIA FLUX image for you ${nickname}! 🎨\n\n📁 saved at: ${filePath}` };
        }
      } catch (e) {}
    }

    const hfKey = process.env.HF_API_KEY;
    if (hfKey) {
      try {
        const res = await axios.post(`https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev`, { inputs: prompt }, { headers: { 'Authorization': `Bearer ${hfKey}` }, responseType: 'arraybuffer' });
        const filePath = path.join(folderManager.getAllFolderPaths().images, `luna_art_${Date.now()}.png`);
        fs.writeFileSync(filePath, res.data);
        try { require('child_process').exec(`start "" "${filePath}"`); } catch {}
        return { response: `generated a HuggingFace image for you ${nickname}! 🎨\n\n📁 saved at: ${filePath}` };
      } catch (e) {}
    }

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux`;
    const res = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const filePath = path.join(folderManager.getAllFolderPaths().images, `luna_art_${Date.now()}.png`);
    fs.writeFileSync(filePath, res.data);
    try { require('child_process').exec(`start "" "${filePath}"`); } catch {}
    return { response: `generated that image for you ${nickname}! 🎨\n\n📁 saved at: ${filePath}` };
  } catch (err) { return { response: `image generation failed ${nickname}: ${err.message} 😅` }; }
}

async function executeVideoGen(message, nickname) {
  try {
    const rawPrompt = message.replace(/^(generate|create|make)\s*(a )?video\s*(of|about|for|showing)?\s*/i, '').trim();
    if (!rawPrompt) return null;
    const prompt = `${rawPrompt}, smooth cinematic motion, high-fidelity, professional quality, cinematic camera angles, vivid colors`;
    emitActivity('generating premium video...', '🎬');

    const klingKey = process.env.KLING_API_KEY;
    if (klingKey) {
      try {
        const res = await axios.post('https://api.klingai.com/v1/videos/text2video', { prompt, duration: '5' }, { headers: { 'Authorization': `Bearer ${klingKey}` } });
        if (res.data?.data?.task_id) {
          await new Promise(r => setTimeout(r, 30000));
          const stat = await axios.get(`https://api.klingai.com/v1/videos/text2video/${res.data.data.task_id}`, { headers: { 'Authorization': `Bearer ${klingKey}` } });
          const link = stat.data?.data?.works?.[0]?.resource?.resource;
          if (link) {
            const vidRes = await axios.get(link, { responseType: 'arraybuffer' });
            const filePath = path.join(folderManager.getAllFolderPaths().videos, `luna_video_${Date.now()}.mp4`);
            fs.writeFileSync(filePath, vidRes.data);
            try { require('child_process').exec(`start "" "${filePath}"`); } catch {}
            return { response: `generated a premium Kling AI video for you ${nickname}! 🎬\n📁 saved at: ${filePath}` };
          }
        }
      } catch (e) {}
    }

    emitActivity('downloading video...', '⬇️');
    const videoUrl = `https://gen.pollinations.ai/video/${encodeURIComponent(prompt)}`;
    const response = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 180000 });
    const filePath = path.join(folderManager.getAllFolderPaths().videos, `luna_video_${Date.now()}.mp4`);
    fs.writeFileSync(filePath, response.data);
    try { require('child_process').exec(`start "" "${filePath}"`); } catch {}
    return { response: `generated your video baddy! 🎬\n📁 saved at: ${filePath}` };
  } catch (err) {
    try {
      emitActivity('video APIs failed, healing with image...', '💖');
      const imgRes = await executeImageGen(message, nickname);
      if (imgRes && imgRes.response) return { response: `I cannot make a video right now, but I made an image for you instead! 🖼️\n\n**✨ AUTONOMOUS HEALING ✨**\n\n${imgRes.response}` };
    } catch(e) {}
    return { response: `video generation failed ${nickname}: ${err.message} 😅` };
  }
}

async function executeDocCreate(message, nickname) {
  try {
    const paths = folderManager.getAllFolderPaths();
    const lower = message.toLowerCase();
    let docType = 'docx';
    if (/ppt|powerpoint|presentation|slides/.test(lower)) docType = 'pptx';
    else if (/excel|spreadsheet|xlsx|csv|table/.test(lower)) docType = 'xlsx';
    else if (/pdf/.test(lower)) docType = 'pdf';

    emitActivity(`planning ${docType} structure...`, '📋');
    const contentResult = await brain.smartCall([{
      role: 'user',
      content: `User wants a ${docType} document: "${message}".\n\nReturn JSON: { "title": "...", "sections": [ { "heading": "...", "content": "..." } ] }`
    }], 'You are Luna, creating rich document content. Return ONLY JSON.', 'creative');

    let docData = { title: 'Luna Document', sections: [{ heading: 'Content', content: contentResult.content || '' }] };
    try {
      const cleanJson = contentResult.content.match(/\{[\s\S]*\}/)?.[0] || contentResult.content;
      docData = JSON.parse(cleanJson);
    } catch (e) {}

    const fileName = `luna_${docData.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'doc'}_${Date.now()}`;
    let filePath;

    if (docType === 'docx') {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
      const children = [new Paragraph({ children: [new TextRun({ text: docData.title || 'Document', bold: true, size: 48 })], heading: HeadingLevel.TITLE })];
      for (const sec of (docData.sections || [])) {
        if (sec.heading) children.push(new Paragraph({ text: sec.heading, heading: HeadingLevel.HEADING_1 }));
        if (sec.content) children.push(new Paragraph({ children: [new TextRun({ text: sec.content, size: 24 })] }));
      }
      const doc = new Document({ sections: [{ children }] });
      filePath = path.join(paths.documents, `${fileName}.docx`);
      fs.writeFileSync(filePath, await Packer.toBuffer(doc));
    } else if (docType === 'pptx') {
      const PptxGenJS = require('pptxgenjs');
      const pptx = new PptxGenJS();
      pptx.title = docData.title || 'Presentation';
      const titleSlide = pptx.addSlide();
      titleSlide.addText(docData.title || 'Presentation', { x: 0.5, y: 1.2, w: 9, h: 2, fontSize: 40, bold: true, align: 'center' });
      for (const sec of (docData.sections || [])) {
        const slide = pptx.addSlide();
        slide.addText(sec.heading || '', { x: 0.5, y: 0.1, w: 9, h: 0.6, fontSize: 22, bold: true });
        slide.addText(sec.content || '', { x: 0.5, y: 1.3, w: 9, h: 4.2, fontSize: 13 });
      }
      filePath = path.join(paths.documents, `${fileName}.pptx`);
      await pptx.writeFile({ fileName: filePath });
    } else if (docType === 'xlsx') {
      const ExcelJS = require('exceljs');
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet(docData.title || 'Sheet1');
      const rows = docData.rows || docData.sections?.map(s => [s.heading, s.content]) || [['No data']];
      for (const row of rows) ws.addRow(row);
      filePath = path.join(paths.documents, `${fileName}.xlsx`);
      await wb.xlsx.writeFile(filePath);
    } else {
      const { PDFDocument, StandardFonts } = require('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      let page = pdfDoc.addPage();
      let y = page.getHeight() - 60;
      page.drawText(docData.title || 'Document', { x: 50, y, font, size: 24 });
      y -= 40;
      for (const sec of (docData.sections || [])) {
        if (sec.heading) { page.drawText(sec.heading, { x: 50, y, font, size: 14 }); y -= 25; }
        if (sec.content) { page.drawText(sec.content.substring(0, 100), { x: 50, y, font, size: 11 }); y -= 16; }
      }
      filePath = path.join(paths.documents, `${fileName}.pdf`);
      fs.writeFileSync(filePath, await pdfDoc.save());
    }

    try { require('child_process').exec(`start "" "${filePath}"`); } catch {}
    return { response: `created your document ${nickname}! 📄\n📁 saved at: ${filePath}`, providerUsed: contentResult.providerUsed };
  } catch (err) { return { response: `document creation failed: ${err.message} 😅`, providerUsed: 'error' }; }
}

async function executeResearch(message, nickname) {
  try {
    const query = message.replace(/^(search|research|find|look up|what'?s the latest)\s*(for|about|on)?\s*/i, '').trim();
    if (!query) return null;
    emitActivity(`searching the web for "${query}"...`, '🔍');
    const result = await searchEngine.searchAndSummarize(query, `You are Luna. Summarize these search results for ${nickname}.`);
    if (result && result.success && result.answer) {
      let response = result.answer;
      if (result.sources?.length > 0) response += '\n\n📎 sources:\n' + result.sources.slice(0, 3).map(s => `• ${s.title} — ${s.url}`).join('\n');
      return { response, providerUsed: result.provider || 'search+ai' };
    }
    return null;
  } catch { return null; }
}

async function executeSummarizeLink(message, nickname) {
  try {
    const urlMatch = message.match(/(https?:\/\/[^\s]+)/i);
    if (!urlMatch) return null;
    const url = urlMatch[1];
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      emitActivity('fetching YouTube transcript...', '🎬');
      const result = await studentTools.summarizeYouTube(url);
      if (result?.success) return { response: `yo ${nickname}, i watched that video! 🎬\n\n**${result.title}**\n\n${result.summary}`, providerUsed: result.providerUsed || 'youtube-transcript' };
    }
    emitActivity(`fetching and summarizing link...`, '🌐');
    const result = await searchEngine.summarizeLink(url);
    if (result?.success) return { response: `yo ${nickname}, i checked that link! 🌐\n\n**${result.title}**\n\n${result.summary}`, providerUsed: 'link-summary' };
    return { response: `oops i couldn't read that link 😅`, providerUsed: 'system' };
  } catch (err) { return { response: `link summary failed: ${err.message}`, providerUsed: 'error' }; }
}

async function executeStudent(message, nickname) {
  try {
    const lower = message.toLowerCase();
    if (/youtube\.com|youtu\.be/i.test(message)) {
      const urlMatch = message.match(/(https?:\/\/[^\s]+youtube[^\s]+|https?:\/\/youtu\.be\/[^\s]+)/i);
      if (urlMatch) {
        emitActivity('fetching YouTube transcript...', '📺');
        const result = await studentTools.summarizeYouTube(urlMatch[1]);
        if (result.success) return { response: `yo ${nickname}, i watched that video! 📺\n\n${result.summary}`, providerUsed: result.providerUsed };
      }
    }
    if (/feynman|explain.*like.*10|analog/i.test(lower)) {
      const topic = message.replace(/.*(?:feynman|explain)\s*(?:about|on|what is)?\s*/i, '').trim();
      emitActivity('simplifying topic...', '🧠');
      const result = await studentTools.feynmanExplain(topic || 'Science');
      if (result.success) return { response: result.explanation, providerUsed: result.providerUsed };
    }
    if (/recall|quiz|test me/i.test(lower)) {
      const topic = message.replace(/.*(?:recall|quiz|test me)\s*(?:on|about)?\s*/i, '').trim();
      emitActivity('generating quiz...', '❓');
      const result = await studentTools.activeRecall(topic || 'Science');
      if (result.success) return { response: `let's do active recall! 🧠\n\n**Question:** ${result.question}`, providerUsed: 'active-recall' };
    }
    return null;
  } catch (err) { return null; }
}

async function executePdfRead(message, nickname) {
  try {
    const pathMatch = message.match(/"([^"]+\.pdf)"/i) || message.match(/'([^']+\.pdf)'/i) || message.match(/([A-Za-z]:\\[^\n"]+\.pdf)/i) || message.match(/(\/[^\n"]+\.pdf)/i);
    if (!pathMatch) return null;
    const filePath = pathMatch[1].trim();
    if (!fs.existsSync(filePath)) return { response: `couldn't find that file ${nickname} 😅`, providerUsed: 'local' };
    
    emitActivity('reading PDF...', '📄');
    let textContent = '';
    try {
      const pdfParse = require('pdf-parse');
      textContent = (await pdfParse(fs.readFileSync(filePath))).text;
    } catch {
      try { textContent = fs.readFileSync(filePath, 'utf-8'); } catch { return { response: `couldn't read that PDF 😅`, providerUsed: 'local' }; }
    }
    if (!textContent || textContent.trim().length < 10) return { response: `PDF seems empty 😅`, providerUsed: 'local' };
    
    const truncated = textContent.slice(0, 4000);
    emitActivity('summarizing...', '🧠');
    const result = await brain.smartCall([{ role: 'user', content: `Summarize:\n${truncated}` }], 'You are Luna, summarizing a PDF.', 'summarize');
    return { response: `📄 **${path.basename(filePath)}**\n\n${result.content}`, providerUsed: result.providerUsed };
  } catch (err) { return { response: `PDF reading failed: ${err.message}`, providerUsed: 'error' }; }
}

module.exports = {
  executeImageGen,
  executeVideoGen,
  executeDocCreate,
  executeResearch,
  executeSummarizeLink,
  executeStudent,
  executePdfRead
};
