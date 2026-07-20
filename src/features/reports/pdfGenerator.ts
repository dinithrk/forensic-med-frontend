import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ForensicReportDto } from '../../services/report.service';

export const buildReportPdfDoc = (report: ForensicReportDto): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const details = report.detailsJson ? JSON.parse(report.detailsJson) : {};

  if (report.reportType === 'CERTIFICATE_OF_RECEIPT') {
    generateCertificateOfReceiptPdf(doc, report, details);
  } else if (report.reportType === 'PMR') {
    generatePostmortemReportPdf(doc, report, details);
  } else {
    generateMlrReportPdf(doc, report, details);
  }

  return doc;
};

export const generateReportPdf = (report: ForensicReportDto) => {
  const doc = buildReportPdfDoc(report);
  doc.save(`${report.serialNo || 'Forensic_Report'}.pdf`);
};

export const getReportPdfBlobUrl = (report: ForensicReportDto): string => {
  const doc = buildReportPdfDoc(report);
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
};

export const printReportPdf = (report: ForensicReportDto) => {
  const doc = buildReportPdfDoc(report);
  doc.autoPrint();
  const blobUrl = doc.output('bloburl');
  const printWindow = window.open(blobUrl, '_blank');
  if (printWindow) {
    printWindow.focus();
  }
};

// --- Medico-Legal Report (MLR) ---
const generateMlrReportPdf = (doc: jsPDF, report: ForensicReportDto, details: any) => {
  // Header
  doc.setFillColor(30, 58, 138); // Dark Blue
  doc.rect(0, 0, 210, 28, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MEDICO-LEGAL REPORT (MLR)', 105, 12, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('DEPARTMENT OF FORENSIC MEDICINE & TOXICOLOGY', 105, 18, { align: 'center' });
  doc.text('OFFICIAL JUDICIAL MEDICAL EXAMINATION RECORD', 105, 23, { align: 'center' });

  let y = 36;

  // Metadata Box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 182, 24, 'FD');

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`MLR Serial No:`, 18, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.serialNo || 'N/A'} (Rev v${report.versionNumber || 1})`, 50, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text(`Police Station:`, 18, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.policeStation || 'N/A'}`, 50, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.text(`Police Ref No:`, 18, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.policeRefNo || 'N/A'}`, 50, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.text(`Court Name:`, 110, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.courtName || 'N/A'}`, 140, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text(`Court Case No:`, 110, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.courtCaseNo || 'N/A'}`, 140, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.text(`Date of Trial:`, 110, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.dateOfTrial || 'N/A'}`, 140, y + 18);

  y += 32;

  // Section 1: Subject Identification
  doc.setFillColor(224, 231, 255);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138);
  doc.text('1. PATIENT IDENTIFICATION', 18, y + 5);

  y += 11;
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);

  const idRows = [
    ['Full Name:', details.patientName || report.subjectName || 'N/A', 'Age / Gender:', `${details.patientAge || 'N/A'} yrs / ${details.patientSex || 'N/A'}`],
    ['NIC / Passport:', details.patientNic || 'N/A', 'Contact No:', details.contactNo || 'N/A'],
    ['Hospital / BHT:', `${details.hospitalName || 'N/A'} - W: ${details.hospitalWard || 'N/A'} BHT: ${details.hospitalBhtNo || 'N/A'}`, 'Address:', details.patientAddress || 'N/A']
  ];

  idRows.forEach(row => {
    doc.setFont('helvetica', 'bold');
    doc.text(row[0], 18, y);
    doc.setFont('helvetica', 'normal');
    doc.text(row[1], 50, y);

    doc.setFont('helvetica', 'bold');
    doc.text(row[2], 120, y);
    doc.setFont('helvetica', 'normal');
    doc.text(row[3], 150, y);
    y += 6;
  });

  y += 4;

  // Section 2: Examination & History
  doc.setFillColor(224, 231, 255);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138);
  doc.text('2. EXAMINATION & PATIENT HISTORY', 18, y + 5);

  y += 11;
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);

  doc.setFont('helvetica', 'bold');
  doc.text('Date & Time Examined:', 18, y);
  doc.setFont('helvetica', 'normal');
  doc.text(report.examinationDate ? new Date(report.examinationDate).toLocaleString() : 'N/A', 60, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Place Examined:', 120, y);
  doc.setFont('helvetica', 'normal');
  doc.text(details.placeExamined || 'N/A', 150, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Short History (Patient\'s Words):', 18, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  const historyText = details.shortHistory || 'No statement recorded.';
  const splitHistory = doc.splitTextToSize(historyText, 175);
  doc.text(splitHistory, 18, y);
  y += (splitHistory.length * 5) + 4;

  // Section 3: Injuries Table
  doc.setFillColor(224, 231, 255);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138);
  doc.text('3. INJURIES & BODILY HARM FINDINGS', 18, y + 5);

  y += 9;

  const injuriesData = (details.injuries && details.injuries.length > 0) ?
    details.injuries.map((i: any, idx: number) => [
      idx + 1,
      i.type || 'N/A',
      i.size || 'N/A',
      i.placement || 'N/A',
      i.weapon || 'N/A',
      i.observations || '-'
    ]) : [['-', 'No individual injuries recorded', '-', '-', '-', '-']];

  autoTable(doc, {
    startY: y,
    head: [['#', 'Injury Type', 'Dimensions', 'Placement/Location', 'Weapon Type', 'Observations']],
    body: injuriesData,
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 }
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Section 4: Opinion
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(224, 231, 255);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138);
  doc.text('4. MEDICAL OPINION & CONCLUSION', 18, y + 5);

  y += 11;
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');

  const opinionText = report.opinion || 'No specific opinion recorded.';
  const splitOpinion = doc.splitTextToSize(opinionText, 178);
  doc.text(splitOpinion, 18, y);
  y += (splitOpinion.length * 5) + 12;

  // Doctor Sign-Off Block
  if (y > 240) {
    doc.addPage();
    y = 30;
  }

  doc.setDrawColor(180, 180, 180);
  doc.line(14, y, 196, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('DOCTOR\'S SIGN-OFF & CERTIFICATION:', 14, y);
  y += 15;

  doc.line(130, y, 190, y);
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.text(report.doctorName || 'Dr. Medical Officer', 130, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.text(report.doctorDesignation || 'Judicial Medical Officer', 130, y);
  y += 4;
  doc.text(`SLMC Reg No: ${report.doctorSlmcNo || 'N/A'}`, 130, y);
  y += 4;
  doc.text(`Date of Issue: ${report.finalizedDate ? new Date(report.finalizedDate).toLocaleDateString() : new Date().toLocaleDateString()}`, 130, y);
};

// --- Postmortem Report (PMR) ---
const generatePostmortemReportPdf = (doc: jsPDF, report: ForensicReportDto, details: any) => {
  // Header
  doc.setFillColor(15, 23, 42); // Dark Slate
  doc.rect(0, 0, 210, 28, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('POSTMORTEM EXAMINATION REPORT (PMR)', 105, 12, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('DEPARTMENT OF FORENSIC PATHOLOGY & MEDICO-LEGAL AUTOPSY', 105, 18, { align: 'center' });

  let y = 36;

  // Metadata Box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 182, 24, 'FD');

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`PM Serial No:`, 18, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.serialNo || 'N/A'} (v${report.versionNumber || 1})`, 50, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text(`Exam Date & Time:`, 18, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(report.examinationDate ? new Date(report.examinationDate).toLocaleString() : 'N/A', 50, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.text(`Police Station:`, 18, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.policeStation || 'N/A'}`, 50, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.text(`Inquest / Magistrate:`, 110, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${details.magistrate || details.inquirerName || 'N/A'}`, 145, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text(`Court & Case No:`, 110, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.courtName || 'N/A'} - ${report.courtCaseNo || 'N/A'}`, 145, y + 12);

  y += 32;

  // Section 1: Deceased Particulars
  doc.setFillColor(226, 232, 240);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. PARTICULAR OF THE DECEASED', 18, y + 5);

  y += 11;
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);

  const decRows = [
    ['Full Name:', details.deceasedName || report.subjectName || 'N/A', 'Age / Sex:', `${details.deceasedAge || 'N/A'} yrs / ${details.deceasedSex || 'N/A'}`],
    ['Date of Death:', details.dateOfDeath || 'N/A', 'Place of Death:', details.placeOfDeath || 'N/A'],
    ['Hospital / BHT:', `${details.hospitalName || 'N/A'} BHT: ${details.bhtNo || 'N/A'}`, 'Last Address:', details.deceasedAddress || 'N/A']
  ];

  decRows.forEach(row => {
    doc.setFont('helvetica', 'bold');
    doc.text(row[0], 18, y);
    doc.setFont('helvetica', 'normal');
    doc.text(row[1], 48, y);

    doc.setFont('helvetica', 'bold');
    doc.text(row[2], 120, y);
    doc.setFont('helvetica', 'normal');
    doc.text(row[3], 148, y);
    y += 6;
  });

  y += 4;

  // Section 2: Cause of Death Table
  doc.setFillColor(226, 232, 240);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. CAUSE OF DEATH FINDINGS', 18, y + 5);

  y += 9;

  const codData = (details.causesOfDeath && details.causesOfDeath.length > 0) ?
    details.causesOfDeath.map((c: any, idx: number) => [
      idx === 0 ? 'Primary Cause (1a)' : `Secondary Cause (${idx + 1})`,
      c.description || 'N/A',
      c.severity || '-',
      c.onset || '-'
    ]) : [['Main Cause', 'Cause of death pending toxicology/histopathology', '-', '-']];

  autoTable(doc, {
    startY: y,
    head: [['Category', 'Cause Description', 'Severity', 'Onset to Death']],
    body: codData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 }
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Section 3: Opinion & Observations
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(226, 232, 240);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('3. AUTOPSY FINDINGS & PATHOLOGIST OPINION', 18, y + 5);

  y += 11;
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');

  const opinionText = report.opinion || 'Autopsy findings complete. Final conclusion as stated in cause of death.';
  const splitOpinion = doc.splitTextToSize(opinionText, 178);
  doc.text(splitOpinion, 18, y);
  y += (splitOpinion.length * 5) + 12;

  // Sign-off
  if (y > 240) {
    doc.addPage();
    y = 30;
  }

  doc.setDrawColor(180, 180, 180);
  doc.line(14, y, 196, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('CONSULTANT FORENSIC PATHOLOGICAL SIGN-OFF:', 14, y);
  y += 15;

  doc.line(130, y, 190, y);
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.text(report.doctorName || 'Dr. Forensic Pathologist', 130, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.text(report.doctorDesignation || 'Consultant Judicial Medical Officer', 130, y);
  y += 4;
  doc.text(`SLMC Reg No: ${report.doctorSlmcNo || 'N/A'}`, 130, y);
  y += 4;
  doc.text(`Report Date: ${report.finalizedDate ? new Date(report.finalizedDate).toLocaleDateString() : new Date().toLocaleDateString()}`, 130, y);
};

// --- Certificate of Receipt of Medical Report ---
const generateCertificateOfReceiptPdf = (doc: jsPDF, report: ForensicReportDto, details: any) => {
  // Formal Border
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(1);
  doc.rect(8, 8, 194, 281);
  doc.rect(10, 10, 190, 277);

  let y = 25;

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 58, 138);
  doc.text('IN THE HIGH COURT / MAGISTRATE COURT', 105, y, { align: 'center' });
  y += 8;
  doc.setFontSize(14);
  doc.text('CERTIFICATE OF RECEIPT OF MEDICAL REPORT', 105, y, { align: 'center' });
  y += 6;
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('(Issued pursuant to Medico-Legal Procedure Standards)', 105, y, { align: 'center' });

  y += 18;

  // Key Particulars
  autoTable(doc, {
    startY: y,
    body: [
      ['Court Name:', report.courtName || 'N/A', 'Case Number:', report.courtCaseNo || 'N/A'],
      ['Date of Trial:', report.dateOfTrial || 'N/A', 'Police Station:', report.policeStation || 'N/A'],
      ['MLEF / PM Ref No:', report.serialNo || 'N/A', 'Subject Name:', report.subjectName || details.patientName || details.deceasedName || 'N/A'],
      ['Examination Date:', report.examinationDate ? new Date(report.examinationDate).toLocaleDateString() : 'N/A', 'Dispatch Date:', report.dispatchedDate ? new Date(report.dispatchedDate).toLocaleDateString() : new Date().toLocaleDateString()]
    ],
    theme: 'plain',
    styles: { font: 'times', fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 55 },
      2: { fontStyle: 'bold', cellWidth: 40 },
      3: { cellWidth: 55 }
    },
    margin: { left: 15, right: 15 }
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);

  const declarationText = `This is to certify that the Medico-Legal / Postmortem Examination Report bearing reference number ${report.serialNo || 'N/A'} for ${report.subjectName || 'the subject'} has been officially dispatched from the Department of Forensic Medicine and duly delivered/received by the Registrar of ${report.courtName || 'the Court'} under Court Case Reference ${report.courtCaseNo || 'N/A'}.`;

  const splitDeclaration = doc.splitTextToSize(declarationText, 175);
  doc.text(splitDeclaration, 18, y);

  y += (splitDeclaration.length * 6) + 20;

  // Receipt Confirmation Date Block
  doc.setFont('times', 'bold');
  doc.text(`Date of Dispatch: ${report.dispatchedDate ? new Date(report.dispatchedDate).toLocaleDateString() : new Date().toLocaleDateString()}`, 18, y);
  y += 7;
  doc.text(`Date of Receipt Confirmation: ${report.receiptConfirmedDate ? new Date(report.receiptConfirmedDate).toLocaleDateString() : 'Pending Confirmation'}`, 18, y);

  y += 40;

  // Dual Signatures
  doc.setLineWidth(0.5);
  doc.line(20, y, 85, y);
  doc.line(125, y, 190, y);

  y += 5;
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('DISPATCHING FORENSIC OFFICER', 20, y);
  doc.text('COURT REGISTRAR / RECEIVING OFFICER', 125, y);

  y += 5;
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text(report.doctorName || 'Judicial Medical Officer', 20, y);
  doc.text('Signature & Official Court Seal', 125, y);
  y += 4;
  doc.text(`SLMC Reg No: ${report.doctorSlmcNo || 'N/A'}`, 20, y);
};
