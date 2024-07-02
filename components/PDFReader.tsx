// Ensure your imports are correctly pointing to where the modules are.
import React, { useEffect, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import "pdfjs-dist/legacy/build/pdf.worker";

// Set the worker URL
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const PDFReader = ({ file }: { file: File | null}) => {
  const [text, setText] = useState("");

  const extractTextFromPdf = async (file: File) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      if (event.target && event.target.result instanceof ArrayBuffer) {
        const arrayBuffer = event.target.result;
        const loadingTask = getDocument(new Uint8Array(arrayBuffer));

        try {
          const pdfDocument = await loadingTask.promise;
          let extractedText = "";

          for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
            const page = await pdfDocument.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item) => ("str" in item ? item.str : ""))
              .join(" ");
            extractedText += pageText + " ";
          }
          console.log("Extracted Text:" + extractedText);
          setText(extractedText);
        } catch (error) {
          console.error("Error while extracting text from PDF:", error);
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    if (file) {
      extractTextFromPdf(file);
    }
  }, [file]);

  return (
    <textarea
      value={text}
      readOnly
      style={{ width: "100%", height: "200px" }}
    />
  );
};

export default PDFReader;
