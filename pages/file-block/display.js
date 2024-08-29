import { useEffect, useRef, useState } from "@wordpress/element";
import { useSelect, useDispatch } from "@wordpress/data";
import { useDropzone } from "react-dropzone";
import tinyColor from "tinycolor2";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import UploadAreaContent from "./upload-area-content";
import { useTheme, useMessages } from "@quillforms/renderer-core";
import { css } from "emotion";

const FileBlockDisplay = ({
  id,
  attributes,
  setIsValid,
  isPreview,
  setIsAnswered,
  setIsPending,
  setPendingMsg,
  setValidationErr,
  blockWithError,
  showNextBtn,
  showErrMsg,
  val,
  setVal,
  isTouchScreen,
}) => {
  const theme = useTheme();
  const messages = useMessages();
  const answersColor = tinyColor(theme.answersColor);

  const { multiple, maxFileSize, allowedFileExtensions, required } = attributes;

  const accept = allowedFileExtensions.trim()
    ? allowedFileExtensions
        .trim()
        .split(",")
        .filter((ext) => ext.trim())
        .map((ext) => `.${ext.trim()}`)
        .join(",")
    : "";

  const mounted = useRef(false);
  const wrapperRef = useRef();
  const { files } = useSelect((select) => {
    return {
      files: select("quillForms-fileblock").getFiles(id) ?? {},
    };
  });
  const filesRef = useRef();
  filesRef.current = files;

  const { addFile, updateFile, deleteFile, reset } = useDispatch(
    "quillForms-fileblock"
  );

  const onDropAccepted = (acceptedFiles) => {
    for (let file of acceptedFiles) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = (file) => {
    if (!file) {
      console.error("No file provided.");
      return;
    }

    // Set the path to the PDF worker script
    GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

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
          console.log("Extracted Text:", extractedText);

          // After successful file handling
          addFile(id, file.name, {
            status: "success",
            progress: 100,
            name: file.name,
            size: file.size,
            type: file.type,
            previewUrlSrc: URL.createObjectURL(file),
          });
        } catch (error) {
          console.error("Error while extracting text from PDF:", error);
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const onDropRejected = (files) => {
    // Show the first error only
    blockWithError(files[0].errors[0].message);
  };

  const { getRootProps, getInputProps } = useDropzone({
    multiple: true,
    maxSize: maxFileSize * 1024 * 1024,
    accept,
    onDropAccepted,
    onDropRejected,
    disabled: false,
  });

  useEffect(() => {
    checkFieldValidation();
  }, [val, attributes]);

  const checkFieldValidation = () => {
    if (required === true && (!val || size(val) === 0)) {
      setIsValid(false);
      setValidationErr(messages["label.errorAlert.required"]);
    } else {
      setIsValid(true);
      setValidationErr(null);
    }
  };

  useEffect(() => {
    mounted.current = true;
    return () => {
      // Clean up pending files
      Object.entries(filesRef.current).forEach(([fileKey, fileData]) => {
        if (fileData.status === "pending") {
          deleteFile(fileKey);
        }
      });
      mounted.current = false;
    };
  }, []);

  return (
    <div className="question__wrapper">
      <div
        {...getRootProps({ className: "dropzone" })}
        className={css`
          & {
            display: flex;
            flex-wrap: wrap;
            margin-top: 15px;
            width: 100%;
            min-height: 300px;
            max-height: 300px;
            overflow-y: auto;
            outline: none;
            cursor: pointer;
            background: ${answersColor.setAlpha(0.1).toString()};
            border: 1px dashed ${answersColor.setAlpha(0.8).toString()};

            &:hover {
              background: ${answersColor.setAlpha(0.2).toString()};
            }
          }
        `}
        ref={wrapperRef}
      >
        <input {...getInputProps()} />
        <UploadAreaContent attributes={attributes} blockId={id} files={files} />
      </div>
    </div>
  );
};

export default FileBlockDisplay;
