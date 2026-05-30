import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function PDFExportButton({ weddingData }) {
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  const handleDownloadPDF = async () => {
    setExporting(true);
    setStatus(null);

    const webhookUrl = import.meta.env.VITE_N8N_PDF_WEBHOOK_URL || '';
    
    // Prepare payload
    const payload = {
      timestamp: new Date().toISOString(),
      platform: 'Modern Elegance Wedding Suite',
      data: weddingData,
    };

    console.log('[PDF Export] Initiating report download...', payload);

    try {
      if (!webhookUrl) {
        // Mock network delay if no webhook url is configured
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log('[PDF Export] Success (Mock mode). Payload:', payload);
        setStatus('success');
      } else {
        // Send request to n8n webhook
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Webhook response error: ${response.statusText}`);
        }

        // Check if response contains a blob (PDF) or a JSON link
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/pdf')) {
          const blob = await response.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `Wedding_Summary_Report_${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(link);
          link.click();
          link.remove();
        } else {
          // Assume JSON response containing download URL
          const result = await response.json();
          if (result.downloadUrl) {
            window.open(result.downloadUrl, '_blank');
          } else {
            console.log('[PDF Export] Webhook triggered successfully:', result);
          }
        }
        setStatus('success');
      }
    } catch (err) {
      console.error('[PDF Export] Failed to download PDF:', err);
      setStatus('error');
    } finally {
      setExporting(false);
      // Reset status indicator after a few seconds
      setTimeout(() => setStatus(null), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <motion.button
        whileHover={{ scale: 1.01, brightness: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleDownloadPDF}
        disabled={exporting}
        className="w-full relative overflow-hidden py-3.5 px-6 rounded-lg font-label-md text-label-md text-white font-semibold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 select-none bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#b08b26] border border-[#d4af37]/20"
      >
        {/* Shimmer Effect */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

        {exporting ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Generating Summary Report...</span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
            <span>Export Wedding PDF Report</span>
          </>
        )}
      </motion.button>

      {/* Status Notifications */}
      {status === 'success' && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs font-semibold text-primary flex items-center justify-center gap-1 mt-1"
        >
          <span className="material-symbols-outlined text-[14px]">check_circle</span>
          Report Exported Successfully
        </motion.p>
      )}
      {status === 'error' && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs font-semibold text-error flex items-center justify-center gap-1 mt-1"
        >
          <span className="material-symbols-outlined text-[14px]">error</span>
          Export failed. Try again.
        </motion.p>
      )}
    </div>
  );
}
