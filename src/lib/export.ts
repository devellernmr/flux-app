import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

interface ReportData {
  stats: any;
  chartsIds: string[]; // IDs dos elementos HTML dos gráficos para captura
}

export async function generateAnalyticsPDF(data: ReportData, agencyName: string) {
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString();

  // 1. Header
  doc.setFillColor(10, 10, 10); // Background dark
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("Relatório de Performance", 15, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(150, 150, 150);
  doc.text(`${agencyName} • Gerado em ${today}`, 15, 30);

  // 2. Stats Summary
  let yPos = 50;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text("Resumo de Métricas", 15, yPos);
  
  yPos += 10;

  const kpiData = [
      ["Projetos Ativos", data.stats.activeProjects],
      ["Total de Arquivos", data.stats.totalFiles],
      ["Taxa de Aprovação", `${data.stats.approvalRate}%`],
      ["Pendências", data.stats.pendingCount]
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Métrica', 'Valor']],
    body: kpiData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] }, // Blue
    margin: { left: 15 }
  });

  // Fix type for finalY
  yPos = (doc as any).lastAutoTable.finalY + 20;

  // 3. Capturar Gráficos com html2canvas
  for (const chartId of data.chartsIds) {
      const element = document.getElementById(chartId);
      if (element) {
          try {
            const canvas = await html2canvas(element, { 
                backgroundColor: '#050505',
                scale: 2 // Melhor qualidade
            });
            const imgData = canvas.toDataURL('image/png');
            
            // Adicionar nova página se necessário
            if (yPos > 200) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(14);
            doc.text("Visualização Gráfica", 15, yPos);
            yPos += 10;

            const imgProps = doc.getImageProperties(imgData);
            const pdfWidth = doc.internal.pageSize.getWidth() - 30;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            doc.addImage(imgData, 'PNG', 15, yPos, pdfWidth, pdfHeight);
            yPos += pdfHeight + 20;

          } catch (e) {
              console.error("Erro ao capturar gráfico", e);
          }
      }
  }

  doc.save(`Relatorio_${agencyName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
}

export function generateAnalyticsCSV(data: any, agencyName: string) {
    if (!data.stats) return;

    const headers = ["Métrica", "Valor"];
    const rows = [
        ["Agência", agencyName],
        ["Data do Relatório", new Date().toLocaleDateString()],
        [""],
        ["Projetos Ativos", data.stats.activeProjects],
        ["Total de Arquivos", data.stats.totalFiles],
        ["Taxa de Aprovação (%)", data.stats.approvalRate],
        ["Pendências", data.stats.pendingCount],
        ["Aprovados", data.stats.approvedCount],
        ["Rejeitados/Ajustes", data.stats.rejectedCount],
    ];

    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Analytics_${agencyName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
