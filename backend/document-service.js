const fs = require('fs');
const path = require('path');
const folderManager = require('./folder-manager');

function setDependencies({ emitActivity, brain }) {
  this.emitActivity = emitActivity;
  this.brain = brain;
}

async function executePdfRead(message, nickname) {
  try {
    const pathMatch = message.match(/"([^"]+\.pdf)"/i) || 
                      message.match(/'([^']+\.pdf)'/i) || 
                      message.match(/([A-Za-z]:\\[^\n"]+\.pdf)/i) || 
                      message.match(/(\/[^\n"]+\.pdf)/i);
    if (!pathMatch) return null;

    const filePath = pathMatch[1].trim();
    if (!fs.existsSync(filePath)) {
      return { response: `couldn't find that file ${nickname} 😅\npath: ${filePath}\n\nmake sure the file exists!`, providerUsed: 'local' };
    }

    if (this.emitActivity) this.emitActivity('reading PDF content...', '📄');
    let textContent = '';
    try {
      const pdfParse = require('pdf-parse');
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      textContent = data.text;
    } catch {
      try {
        textContent = fs.readFileSync(filePath, 'utf-8');
      } catch {
        return { response: `couldn't read that PDF ${nickname} — file might be corrupted or locked 😅`, providerUsed: 'local' };
      }
    }

    if (!textContent || textContent.trim().length < 10) {
      return { response: `that PDF seems empty or has only images ${nickname} — no text to summarize 😅`, providerUsed: 'local' };
    }

    const truncated = textContent.slice(0, 4000);
    const wasTruncated = textContent.length > 4000;

    if (this.emitActivity) this.emitActivity('summarizing content...', '🧠');
    const result = await this.brain.smartCall([{
      role: 'user',
      content: `Summarize the following PDF content. Give key points and a brief overview. Be Luna — concise, Gen-Z:\n\n---PDF CONTENT---\n${truncated}\n---END PDF---${wasTruncated ? '\n\n(document was truncated, there is more content)' : ''}`,
    }], `You are Luna, summarizing a PDF for ${nickname}. Be helpful and clear.`, 'summarize');

    const fileName = path.basename(filePath);
    return {
      response: `📄 **${fileName}** — here's the summary:\n\n${result.content}${wasTruncated ? `\n\n⚠️ the PDF was ${Math.round(textContent.length / 1000)}k characters, I summarized the first ~4k chars` : ''}`,
      providerUsed: result.providerUsed,
    };
  } catch (err) {
    return { response: `PDF reading failed: ${err.message}`, providerUsed: 'error' };
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

    if (this.emitActivity) this.emitActivity(`planning ${docType} structure...`, '📋');
    const contentResult = await this.brain.smartCall([{
      role: 'user',
      content: `User wants a ${docType} document: "${message}".\n\nReturn ONLY a JSON object:\n{\n  "title": "Document Title",\n  "bgColor": "Hex code (e.g. 0F0F1A)",\n  "titleColor": "Hex code (e.g. A78BFA)",\n  "accentColor": "Hex code (e.g. 7C3AED)",\n  "sections": [\n    { "heading": "Section Title", "content": "detailed, rich paragraph text with professional formatting" }\n  ]\n}\n\nCREATIVE QUALITY RULES:\n- Write detailed, insightful, professional content for each section\n- For presentations: each section becomes a slide. Generate UNIQUE, creative, and beautiful Hex color themes for the presentation!\n- Include at least 5-8 meaningful sections with real substance\n- Use professional business language, not generic filler text\n- For spreadsheets, return { "title": "Sheet", "rows": [["Header1","Header2"],["data1","data2"]] }.`
    }], 'You are Luna, an advanced AI desktop companion built by Ravikiran. If asked about your features, you do PC control, web search, code generation, plugin building, PC system info tracking, UI generation, document creation, and much more. Create rich, detailed, high-quality content. Return ONLY valid JSON. No markdown.', 'creative');

    let docData;
    try {
      if (!contentResult.success || !contentResult.content) throw new Error(contentResult.content || 'AI returned no content');
      const cleanJson = contentResult.content.match(/\{[\s\S]*\}/)?.[0] || contentResult.content;
      docData = JSON.parse(cleanJson);
    } catch (err) {
      if (!contentResult.success) {
         return { response: `I couldn't generate the document content ${nickname} — ${err.message}`, providerUsed: 'error' };
      }
      docData = { title: 'Luna Document', sections: [{ heading: 'Content', content: contentResult.content || 'No content generated.' }] };
    }

    const fileName = `luna_${docData.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'doc'}_${Date.now()}`;
    let filePath;

    if (docType === 'docx') {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
      const children = [];
      children.push(new Paragraph({ children: [new TextRun({ text: docData.title || 'Document', bold: true, size: 48 })], heading: HeadingLevel.TITLE }));
      for (const sec of (docData.sections || [])) {
        if (sec.heading) children.push(new Paragraph({ text: sec.heading, heading: HeadingLevel.HEADING_1 }));
        if (sec.content) children.push(new Paragraph({ children: [new TextRun({ text: sec.content, size: 24 })] }));
      }
      const doc = new Document({ sections: [{ children }] });
      const buffer = await Packer.toBuffer(doc);
      filePath = path.join(paths.documents, `${fileName}.docx`);
      fs.writeFileSync(filePath, buffer);
    } else if (docType === 'pptx') {
      const PptxGenJS = require('pptxgenjs');
      const pptx = new PptxGenJS();
      pptx.title = docData.title || 'Presentation';
      const titleSlide = pptx.addSlide();
      const bgColor = (docData.bgColor || '0F0F1A').replace('#', '');
      const titleColor = (docData.titleColor || 'A78BFA').replace('#', '');
      const accentColor = (docData.accentColor || '7C3AED').replace('#', '');
      
      titleSlide.background = { color: bgColor };
      titleSlide.addText(docData.title || 'Presentation', { x: 0.5, y: 1.2, w: 9, h: 2, fontSize: 40, bold: true, color: titleColor, align: 'center', fontFace: 'Segoe UI' });
      titleSlide.addText(`Created by Luna AI for ${nickname}`, { x: 0.5, y: 3.2, w: 9, h: 1, fontSize: 14, color: '8888AA', align: 'center', fontFace: 'Segoe UI' });
      titleSlide.addText('🌙', { x: 4.5, y: 4.2, w: 1, h: 0.8, fontSize: 32, align: 'center' });
      
      for (const sec of (docData.sections || [])) {
        const slide = pptx.addSlide();
        slide.background = { color: bgColor };
        slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.8, fill: { color: accentColor } });
        slide.addText(sec.heading || '', { x: 0.5, y: 0.1, w: 9, h: 0.6, fontSize: 22, bold: true, color: 'FFFFFF', fontFace: 'Segoe UI' });
        slide.addText(sec.content || '', { x: 0.5, y: 1.3, w: 9, h: 4.2, fontSize: 13, color: 'C4C4D4', valign: 'top', wrap: true, fontFace: 'Segoe UI', lineSpacing: 22 });
      }
      filePath = path.join(paths.documents, `${fileName}.pptx`);
      await pptx.writeFile({ fileName: filePath });
    } else if (docType === 'xlsx') {
      const ExcelJS = require('exceljs');
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet(docData.title || 'Sheet1');
      const rows = docData.rows || docData.sections?.map(s => [s.heading, s.content]) || [['No data']];
      for (const row of rows) ws.addRow(row);
      if (ws.getRow(1)) {
        ws.getRow(1).font = { bold: true };
        ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
        ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      }
      filePath = path.join(paths.documents, `${fileName}.xlsx`);
      await wb.xlsx.writeFile(filePath);
    } else {
      const { PDFDocument, StandardFonts } = require('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const clean = (s) => (s||'').replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, '-').replace(/[^\x00-\x7F]/g, "");
      
      let page = pdfDoc.addPage();
      let y = page.getHeight() - 60;
      page.drawText(clean(docData.title) || 'Document', { x: 50, y, font: boldFont, size: 24 });
      y -= 40;
      for (const sec of (docData.sections || [])) {
        if (y < 80) { page = pdfDoc.addPage(); y = page.getHeight() - 60; }
        if (sec.heading) { page.drawText(clean(sec.heading), { x: 50, y, font: boldFont, size: 14 }); y -= 25; }
        if (sec.content) {
          const cleanContent = clean(sec.content);
          const lines = cleanContent.match(/.{1,80}/g) || [cleanContent];
          for (const line of lines) {
            if (y < 50) { page = pdfDoc.addPage(); y = page.getHeight() - 60; }
            page.drawText(line, { x: 50, y, font, size: 11 }); y -= 16;
          }
          y -= 10;
        }
      }
      const pdfBytes = await pdfDoc.save();
      filePath = path.join(paths.documents, `${fileName}.pdf`);
      fs.writeFileSync(filePath, pdfBytes);
    }

    try { require('child_process').exec(`start "" "${filePath}"`); } catch {}

    const typeNames = { docx: 'Word document', pptx: 'PowerPoint presentation', xlsx: 'Excel spreadsheet', pdf: 'PDF document' };
    return {
      response: `created your ${typeNames[docType]} ${nickname}! 📄\n\n📝 "${docData.title}"\n📁 saved at: ${filePath}\n\nopened it for you ✅`,
      providerUsed: contentResult.providerUsed,
    };
  } catch (err) {
    return { response: `document creation failed ${nickname}: ${err.message} 😅`, providerUsed: 'error' };
  }
}

module.exports = {
  setDependencies,
  executePdfRead,
  executeDocCreate
};
