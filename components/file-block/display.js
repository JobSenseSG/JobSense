import { useEffect, useRef } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { useDropzone } from 'react-dropzone';
import tinyColor from 'tinycolor2';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import UploadAreaContent from './upload-area-content';
import { useTheme, useMessages } from '@quillforms/renderer-core';
import { css } from 'emotion';

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
      .split(',')
      .filter((ext) => ext.trim())
      .map((ext) => `.${ext.trim()}`)
      .join(',')
    : '';

  const mounted = useRef(false);
  const wrapperRef = useRef();
  const { files } = useSelect((select) => {
    return {
      files: select('quillForms-fileblock').getFiles(id) ?? {},
    };
  });
  const filesRef = useRef();
  filesRef.current = files;

  const { addFile, updateFile, deleteFile, reset } = useDispatch(
    'quillForms-fileblock'
  );

  // Make handleFileUpload an async function
  const handleFileUpload = async (file) => {
    if (!file) {
      console.error('No file provided.');
      return;
    }
    console.log('Uploading file:', file);

    // Set the path to the PDF worker script
    GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

    // Use a promise to handle FileReader
    const arrayBuffer = await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target && event.target.result instanceof ArrayBuffer) {
          resolve(event.target.result);
        } else {
          reject(new Error('Failed to read file.'));
        }
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });

    try {
      const loadingTask = getDocument(new Uint8Array(arrayBuffer));
      const pdfDocument = await loadingTask.promise;
      let extractedText = '';

      for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ');
        extractedText += pageText + ' ';
      }

      console.log('Extracted Text from PDF:', extractedText);

      // Get the current stored text and append the new extracted text with separator
      const currentExtractedText = localStorage.getItem('extractedText') || '';
      const separator = currentExtractedText
        ? '\n----------------------------------------------------------------\n'
        : '';
      const updatedExtractedText = currentExtractedText + separator + extractedText;

      // Store the updated extracted text into localStorage
      localStorage.setItem('extractedText', updatedExtractedText);
      console.log('Updated extracted text saved in localStorage.');

      // After successful file handling
      addFile(id, file.name, {
        status: 'success',
        progress: 100,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrlSrc: URL.createObjectURL(file),
      });

      // Update val to include the uploaded file
      setVal((prevVal) => {
        const updatedVal = [...(prevVal || []), file];
        console.log('Updated val after file upload:', updatedVal);
        return updatedVal;
      });
    } catch (error) {
      console.error('Error while extracting text from PDF:', error);
    }
  };

  // Modify onDropAccepted to process files sequentially
  const onDropAccepted = async (acceptedFiles) => {
    for (let file of acceptedFiles) {
      await handleFileUpload(file);
    }
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
    console.log('Checking field validation...');
    console.log('Val:', val);
    if (required === true && (!val || val.length === 0)) {
      setIsValid(false);
      setValidationErr(messages['label.errorAlert.required']);
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
        if (fileData.status === 'pending') {
          deleteFile(fileKey);
        }
      });
      mounted.current = false;
    };
  }, []);

  return (
    <div className="question__wrapper">
      <div
        {...getRootProps({ className: 'dropzone' })}
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
