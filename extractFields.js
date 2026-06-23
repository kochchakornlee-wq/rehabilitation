const { PDFDocument } = require("pdf-lib");
const fs = require("fs");

async function extractPdfFields() {
  // 1. อ่านไฟล์ PDF ที่เราทำ Prepare Form มาแล้ว
  const formPdfBytes = fs.readFileSync("./public/templates/OPD_template.pdf");

  // 2. โหลด PDF เข้าไปใน pdf-lib
  const pdfDoc = await PDFDocument.load(formPdfBytes);

  // 3. ดึงฟอร์มทั้งหมดออกมา
  const form = pdfDoc.getForm();

  // 4. ดึงรายชื่อฟิลด์ทั้งหมด
  const fields = form.getFields();

  console.log("--- สรุปรายชื่อฟิลด์ใน PDF ---");
  fields.forEach((field) => {
    const type = field.constructor.name; // ดูว่าเป็น Text, Checkbox, หรือ Radio
    const name = field.getName(); // ชื่อฟิลด์ที่เราตั้งไว้ใน Acrobat
    console.log(`[${type}] Name: ${name}`);
  });
}

extractPdfFields();
