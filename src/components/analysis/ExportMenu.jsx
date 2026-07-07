import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import jsPDF from "jspdf";

export default function ExportMenu({ document, onExportStart, onExportEnd }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState(null);

  const exportToPDF = async () => {
    setIsExporting(true);
    setExportType("pdf");
    if (onExportStart) onExportStart();

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // RTL support - set text direction
      doc.setR2L(true);
      
      // Add Hebrew font support (using built-in fonts)
      doc.setFont("helvetica");
      
      let yPos = 20;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const maxWidth = pageWidth - (2 * margin);

      // Title
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(document.title, pageWidth - margin, yPos, { align: "right" });
      yPos += 15;

      // Date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const dateText = `תאריך: ${new Date(document.created_date).toLocaleDateString('he-IL')}`;
      doc.text(dateText, pageWidth - margin, yPos, { align: "right" });
      yPos += 10;

      // Line separator
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      const analysis = document.ai_analysis || {};

      // Helper function to add text with wrapping
      const addWrappedText = (text, startY, fontSize = 10, isBold = false) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach((line, index) => {
          if (startY + (index * 7) > doc.internal.pageSize.height - 20) {
            doc.addPage();
            startY = 20;
          }
          doc.text(line, pageWidth - margin, startY + (index * 7), { align: "right" });
        });
        
        return startY + (lines.length * 7);
      };

      // Executive Summary
      if (analysis.executive_summary) {
        yPos = addWrappedText("סיכום מנהלים", yPos, 14, true);
        yPos += 5;
        yPos = addWrappedText(analysis.executive_summary, yPos);
        yPos += 10;
      }

      // Summary
      if (analysis.summary) {
        yPos = addWrappedText("תקציר משפטי", yPos, 14, true);
        yPos += 5;
        yPos = addWrappedText(analysis.summary, yPos);
        yPos += 10;
      }

      // Legal Terms
      if (analysis.legal_terms?.length > 0) {
        yPos = addWrappedText("מושגים משפטיים", yPos, 14, true);
        yPos += 5;
        analysis.legal_terms.forEach((term, index) => {
          yPos = addWrappedText(`${index + 1}. ${term.term}`, yPos, 11, true);
          yPos += 3;
          yPos = addWrappedText(term.explanation, yPos);
          yPos += 8;
        });
      }

      // Risk Factors
      if (analysis.risk_factors?.length > 0) {
        yPos = addWrappedText("סיכונים משפטיים", yPos, 14, true);
        yPos += 5;
        analysis.risk_factors.forEach((risk, index) => {
          yPos = addWrappedText(`• ${risk}`, yPos);
          yPos += 5;
        });
        yPos += 5;
      }

      // Recommendations
      if (analysis.recommendations?.length > 0) {
        yPos = addWrappedText("המלצות", yPos, 14, true);
        yPos += 5;
        analysis.recommendations.forEach((rec, index) => {
          yPos = addWrappedText(`• ${rec}`, yPos);
          yPos += 5;
        });
        yPos += 5;
      }

      // User Notes
      if (document.user_notes?.length > 0) {
        if (yPos > doc.internal.pageSize.height - 40) {
          doc.addPage();
          yPos = 20;
        }
        yPos = addWrappedText("הערות המשתמש", yPos, 14, true);
        yPos += 5;
        document.user_notes.forEach((note, index) => {
          yPos = addWrappedText(`[${note.section}] ${note.note}`, yPos, 9);
          yPos += 7;
        });
      }

      // Footer on each page
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`עמוד ${i} מתוך ${pageCount}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: "center" });
        doc.text("נוצר ב-Decifra.ai", pageWidth - margin, doc.internal.pageSize.height - 10, { align: "right" });
      }

      // Save the PDF
      const fileName = `${document.title.replace(/\.[^/.]+$/, "")}_analysis.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("שגיאה בייצוא PDF. אנא נסו שוב.");
    }

    setIsExporting(false);
    setExportType(null);
    if (onExportEnd) onExportEnd();
  };

  return (
    <div className="relative">
      <Button
        onClick={exportToPDF}
        disabled={isExporting}
        size="sm"
        variant="outline"
        className="border-[#E3E6EB] text-[#4A5568] hover:bg-[#F8F9FB]"
      >
        {isExporting && exportType === "pdf" ? (
          <>
            <Loader2 className="w-4 h-4 ml-1 animate-spin" />
            מייצא...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 ml-1" />
            ייצוא PDF
          </>
        )}
      </Button>
    </div>
  );
}