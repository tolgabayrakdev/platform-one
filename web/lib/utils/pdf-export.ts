import { GarageNote, GarageNoteStats } from "@/lib/types/garage-notes";
import { GARAGE_NOTE_TYPE_LABELS } from "@/lib/types/garage-notes";

export function exportGarageNotesToPDF(
  notes: GarageNote[],
  stats: GarageNoteStats | null,
  profileName?: string
) {
  // HTML içeriğini oluştur
  const htmlContent = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Garaj Notlarım</title>
  <style>
    @media print {
      @page {
        margin: 1.5cm;
        size: A4;
      }
      body {
        margin: 0;
        padding: 0;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #333;
      padding-bottom: 15px;
    }
    .header h1 {
      font-size: 24px;
      margin: 0 0 10px 0;
      font-weight: bold;
    }
    .header .user-info {
      font-size: 11px;
      color: #666;
      margin: 5px 0;
    }
    .header .date {
      font-size: 10px;
      color: #999;
    }
    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 30px;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 5px;
    }
    .stat-item {
      text-align: center;
    }
    .stat-label {
      font-size: 10px;
      color: #666;
      margin-bottom: 5px;
    }
    .stat-value {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }
    .notes-section {
      margin-top: 30px;
    }
    .notes-section h2 {
      font-size: 16px;
      margin-bottom: 20px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 8px;
    }
    .note {
      margin-bottom: 25px;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
      page-break-inside: avoid;
    }
    .note-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }
    .note-title {
      font-size: 14px;
      font-weight: bold;
      margin: 0;
    }
    .note-type {
      font-size: 10px;
      padding: 3px 8px;
      border-radius: 3px;
      background-color: #e5e5e5;
      white-space: nowrap;
    }
    .note-date {
      font-size: 10px;
      color: #666;
      margin-top: 5px;
    }
    .note-details {
      margin-top: 10px;
      font-size: 11px;
    }
    .note-detail-row {
      margin: 5px 0;
      display: flex;
      gap: 15px;
    }
    .note-detail-label {
      font-weight: 600;
      min-width: 80px;
    }
    .note-description {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #eee;
      font-size: 11px;
      white-space: pre-wrap;
      color: #555;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 10px;
      color: #999;
    }
    @media print {
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Garaj Notlarım</h1>
    ${profileName ? `<div class="user-info">Kullanıcı: ${profileName}</div>` : ""}
    <div class="date">Oluşturulma Tarihi: ${new Date().toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}</div>
  </div>

  ${stats ? `
  <div class="stats">
    <div class="stat-item">
      <div class="stat-label">Toplam Kayıt</div>
      <div class="stat-value">${stats.total_notes}</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">Toplam Harcama</div>
      <div class="stat-value">${new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        minimumFractionDigits: 0,
      }).format(stats.total_cost)}</div>
    </div>
    ${stats.last_maintenance ? `
    <div class="stat-item" style="grid-column: 1 / -1;">
      <div class="stat-label">Son Bakım</div>
      <div class="stat-value" style="font-size: 14px;">${stats.last_maintenance.title}</div>
      <div style="font-size: 10px; color: #666; margin-top: 5px;">
        ${new Date(stats.last_maintenance.date).toLocaleDateString("tr-TR")}
        ${stats.last_maintenance.mileage ? ` • ${stats.last_maintenance.mileage.toLocaleString("tr-TR")} km` : ""}
      </div>
    </div>
    ` : ""}
  </div>
  ` : ""}

  <div class="notes-section">
    <h2>Kayıtlar</h2>
    ${notes.map((note, index) => {
      const typeLabel = GARAGE_NOTE_TYPE_LABELS[note.type];
      return `
      <div class="note">
        <div class="note-header">
          <div>
            <div class="note-title">${index + 1}. ${typeLabel.emoji} ${note.title}</div>
            <div class="note-date">${new Date(note.date).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</div>
          </div>
          <span class="note-type">${typeLabel.label}</span>
        </div>
        <div class="note-details">
          ${note.mileage !== null ? `
          <div class="note-detail-row">
            <span class="note-detail-label">KM:</span>
            <span>${note.mileage.toLocaleString("tr-TR")} km</span>
          </div>
          ` : ""}
          ${note.cost !== null ? `
          <div class="note-detail-row">
            <span class="note-detail-label">Tutar:</span>
            <span>${new Intl.NumberFormat("tr-TR", {
              style: "currency",
              currency: "TRY",
              minimumFractionDigits: 0,
            }).format(note.cost)}</span>
          </div>
          ` : ""}
          ${note.service_location ? `
          <div class="note-detail-row">
            <span class="note-detail-label">Servis Yeri:</span>
            <span>${note.service_location}</span>
          </div>
          ` : ""}
        </div>
        ${note.description ? `
        <div class="note-description">${note.description}</div>
        ` : ""}
      </div>
      `;
    }).join("")}
  </div>

  <div class="footer">
    <p>Bu belge ${new Date().toLocaleDateString("tr-TR")} tarihinde Garaj Muhabbet platformundan oluşturulmuştur.</p>
  </div>
</body>
</html>
  `;

  // Yeni pencerede aç ve yazdır
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("Popup engellendi. Lütfen popup engelleyiciyi kapatın.");
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Sayfa yüklendikten sonra yazdırma dialogunu aç
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      // Yazdırma işlemi tamamlandıktan sonra pencereyi kapat (isteğe bağlı)
      // printWindow.close();
    }, 250);
  };
}
