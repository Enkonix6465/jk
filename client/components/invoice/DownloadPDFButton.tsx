import React from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import logoUrl from "@/components/asserts/logo.png";

interface Props {
  targetRef: React.RefObject<HTMLElement>;
  fileName?: string;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function DownloadPDFButton({
  targetRef,
  fileName = "invoice.pdf",
}: Props) {
  const onDownload = async () => {
    const node = targetRef.current;
    if (!node) return;

    const clone = node.cloneNode(true) as HTMLElement;

    clone.querySelectorAll("img").forEach((img) => {
      try {
        img.setAttribute("crossorigin", "anonymous");
        const src = img.getAttribute("src");
        if (src) img.setAttribute("src", src);
      } catch {}
    });

    const wrapper = document.createElement("div");
    wrapper.style.position = "absolute";
    wrapper.style.left = "-9999px";
    wrapper.style.top = "0px";
    wrapper.style.width = `${node.offsetWidth}px`;
    wrapper.style.height = "auto";
    wrapper.style.minHeight = `${node.offsetHeight}px`;

    clone.style.width = `${node.offsetWidth}px`;
    clone.style.height = "auto";
    clone.style.minHeight = `${node.offsetHeight}px`;

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(clone as HTMLElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        allowTaint: false,
        windowWidth: node.offsetWidth,
        windowHeight: clone.offsetHeight,
        height: clone.offsetHeight,
      });

      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const pxPerPt = canvas.width / pageWidth;

      // Capture top/bottom brand bars from the preview UI (clone)
      const topBarEl = clone.querySelector<HTMLElement>(".top-brand-bar");
      const bottomBarEl = clone.querySelector<HTMLElement>(".bottom-brand-bar");

      let topBarImgData: string | null = null;
      let bottomBarImgData: string | null = null;
      let topBarPxHeight = 0;
      let bottomBarPxHeight = 0;

      if (topBarEl) {
        const topCanvas = await html2canvas(topBarEl, {
          scale: 2,
          backgroundColor: null,
          useCORS: true,
          logging: false,
        });
        topBarImgData = topCanvas.toDataURL("image/png");
        topBarPxHeight = topCanvas.height;
      }

      if (bottomBarEl) {
        const bottomCanvas = await html2canvas(bottomBarEl, {
          scale: 2,
          backgroundColor: null,
          useCORS: true,
          logging: false,
        });
        bottomBarImgData = bottomCanvas.toDataURL("image/png");
        bottomBarPxHeight = bottomCanvas.height;
      }

      // Compute bar sizes in PDF points proportional to page width
      const topBarPt = topBarImgData ? Math.round((topBarPxHeight / canvas.width) * pageWidth) : 0;
      const bottomBarPt = bottomBarImgData ? Math.round((bottomBarPxHeight / canvas.width) * pageWidth) : 0;

      // Define content area in the captured canvas excluding the UI bars
      const contentStartPx = topBarPxHeight;
      const contentEndPx = canvas.height - bottomBarPxHeight;
      const totalContentPx = Math.max(0, contentEndPx - contentStartPx);

      const contentHeightPt = pageHeight - topBarPt - bottomBarPt;
      const sliceHeightPx = Math.max(1, Math.round(contentHeightPt * pxPerPt));

      let drawnPx = 0;

      while (drawnPx < totalContentPx) {
        const remainingPx = totalContentPx - drawnPx;
        const sliceHeight = Math.min(sliceHeightPx, remainingPx);
        const srcY = contentStartPx + drawnPx;

        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = sliceHeight;
        const ctx = slice.getContext("2d");

        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, slice.width, slice.height);
          // Draw only the content portion (exclude bars)
          ctx.drawImage(
            canvas,
            0,
            srcY,
            canvas.width,
            sliceHeight,
            0,
            0,
            slice.width,
            slice.height
          );
        }

        const imgData = slice.toDataURL("image/png");
        const sliceHeightPt = slice.height / pxPerPt;

        // Draw the UI-derived top bar once per page
        if (topBarImgData && topBarPt > 0) {
          pdf.addImage(topBarImgData, "PNG", 0, 0, pageWidth, topBarPt);
        }

        // Content slice between header and footer
        pdf.addImage(imgData, "PNG", 0, topBarPt, pageWidth, sliceHeightPt);

        // Draw the UI-derived bottom bar once per page
        if (bottomBarImgData && bottomBarPt > 0) {
          pdf.addImage(bottomBarImgData, "PNG", 0, pageHeight - bottomBarPt, pageWidth, bottomBarPt);
        }

        drawnPx += sliceHeightPx;
        if (drawnPx < totalContentPx) {
          pdf.addPage();
        }
      }

      pdf.save(fileName);
    } finally {
      try {
        document.body.removeChild(wrapper);
      } catch {}
    }
  };

  return (
    <Button onClick={onDownload} className="bg-[hsl(var(--invoice-blue))] hover:bg-[hsl(var(--invoice-blue))]/90">
      <Download /> Download PDF
    </Button>
  );
}
