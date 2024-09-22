import { Form } from '@quillforms/renderer-core';
import '@quillforms/renderer-core/build-style/style.css';
import { registerCoreBlocks } from '@quillforms/react-renderer-utils';
import { useRouter } from 'next/router';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import { useEffect, useState } from 'react';
import '../components/file-block';

registerCoreBlocks();

interface FormData {
  [key: string]: any;
}

interface FormSubmitParams {
  completeForm: () => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  goToBlock: (blockId: string) => void;
  setSubmissionErr: (error: string) => void;
}

const EnterpriseSolution = () => {
  // set up useeffect that sets local storage extracted text to empty string
  useEffect(() => {
    localStorage.setItem('extractedText', '');
  }, []);

  const router = useRouter();
  const [extractedText, setExtractedText] = useState<string>('');

  const handleFileUpload = (file: File) => {
    console.log('Uploading file:', file);

    // Set the path to the PDF worker script
    GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

    const reader = new FileReader();

    reader.onload = async (event) => {
      if (event.target && event.target.result instanceof ArrayBuffer) {
        const arrayBuffer = event.target.result;
        const loadingTask = getDocument(new Uint8Array(arrayBuffer));

        try {
          const pdfDocument = await loadingTask.promise;
          let extractedText = '';

          for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
            const page = await pdfDocument.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => ('str' in item ? item.str : ''))
              .join(' ');
            extractedText += pageText + ' ';
          }

          // Set the extracted text to state
          setExtractedText(extractedText);
          console.log('Extracted Text from PDF:', extractedText);
        } catch (error) {
          console.error('Error while extracting text from PDF:', error);
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async (
    data: FormData,
    { completeForm, setIsSubmitting, setSubmissionErr }: FormSubmitParams
  ) => {
    console.log('Form data before submission:', data);

    // Retrieve the extracted text from local storage
    const extractedText = localStorage.getItem('extractedText') || '';

    // Ensure that the extracted text is added to the "ud73bsw" block in the "answers" object
    data.answers['ud73bsw'] = {
      ...data.answers['ud73bsw'],
      value: extractedText, // Add extracted text from localStorage here
      isAnswered: !!extractedText, // Mark as answered if text is available
    };

    console.log('Form data after appending extracted text:', data);

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/getAnalysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit data');
      }

      const result = await response.json();
      console.log('Analysis result:', result);

      completeForm(); // Mark form as completed
      setIsSubmitting(false); // Stop submitting state

      router.push({
        pathname: '/teamAnalysisReport',
        query: { analysisData: JSON.stringify(result) },
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmissionErr('Error submitting the form. Please try again.');
      setIsSubmitting(false); // Stop submitting state
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Form
        formId={1}
        formObj={{
          blocks: [
            {
              name: 'welcome-screen',
              id: 'jg1401r',
              attributes: {
                label: "JobSense's Enterprise Solution",
                description: 'Empowering Your Workforce, Driving Your Success.',
                attachment: {
                  type: 'image',
                  url: 'https://vajvudbmcgzbyivvtlvy.supabase.co/storage/v1/object/public/aaa/4207-ai-1-removebg-preview%20(1).jpg',
                },
              },
            },
            {
              name: 'short-text',
              id: 'companyName',
              attributes: {
                required: true,
                label: 'What is the name of your company?',
              },
            },
            {
              name: 'multiple-choice',
              id: 'teamSize',
              attributes: {
                required: true,
                multiple: false,
                label: 'How many developers are there in your team?',
                choices: [
                  { label: '1-5', value: '1-5' },
                  { label: '6-10', value: '6-10' },
                  { label: '11-20', value: '11-20' },
                  { label: '20+', value: '20+' },
                ],
              },
            },
            {
              name: 'multiple-choice',
              id: 'fundingStage',
              attributes: {
                required: true,
                multiple: false,
                label: "What is your company's current funding stage?",
                choices: [
                  { label: 'Pre-seed', value: 'pre-seed' },
                  { label: 'Seed', value: 'seed' },
                  { label: 'Series A', value: 'series-a' },
                  { label: 'Series B', value: 'series-b' },
                  {
                    label: 'Later Stage',
                    value: 'later-stage',
                  },
                ],
              },
            },
            {
              name: 'short-text',
              id: 'industryFocus',
              attributes: {
                required: true,
                label: "What is your company's industry focus?",
              },
            },
            {
              name: 'long-text',
              id: 'objectives',
              attributes: {
                required: true,
                label:
                  "What are your enterprise's objectives for the next 2-3 years?",
                placeholder:
                  "Please describe your company's growth targets, expansion plans, or any other major objectives.",
              },
            },
            {
              name: 'file-upload',
              id: 'extractedText',
              attributes: {
                required: true,
                label: 'Please upload the resumes of your development team.',
                description: 'You can upload multiple PDF files.',
                multiple: true,
              },
            },
          ],
        }}
        applyLogic={true}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default EnterpriseSolution;
