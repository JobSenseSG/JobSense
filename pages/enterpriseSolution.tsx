// import { Form } from "@quillforms/renderer-core";
// import "@quillforms/renderer-core/build-style/style.css";
// import { registerCoreBlocks } from "@quillforms/react-renderer-utils";
// import "./file-block";
// import { useRouter } from "next/router";

// registerCoreBlocks();

// const EnterpriseSolution = () => {
//   const router = useRouter();

//   return (
//     <div style={{ width: "100%", height: "100vh" }}>
//       <Form
//         formId={1}
//         formObj={{
//           blocks: [
//             {
//               name: "welcome-screen",
//               id: "jg1401r",
//               attributes: {
//                 label: "JobSense's Enterprise Solution",
//                 description: "Empowering Your Workforce, Driving Your Success.",
//                 attachment: {
//                   type: "image",
//                   url: "https://vajvudbmcgzbyivvtlvy.supabase.co/storage/v1/object/public/aaa/4207-ai-1-removebg-preview%20(1).jpg",
//                 },
//               },
//             },
//             {
//               name: "short-text",
//               id: "kd12edg",
//               attributes: {
//                 classnames: "first-block",
//                 required: true,
//                 label: "What is the name of your company?",
//               },
//             },
//             {
//               name: "multiple-choice",
//               id: "gqr1294c",
//               attributes: {
//                 required: true,
//                 multiple: false,
//                 verticalAlign: false,
//                 label: "How many developers are there in your team?",
//                 choices: [
//                   {
//                     label: "1-5",
//                     value: "1-5",
//                   },
//                   {
//                     label: "6-10",
//                     value: "6-10",
//                   },
//                   {
//                     label: "11-20",
//                     value: "11-20",
//                   },
//                   {
//                     label: "20+",
//                     value: "20+",
//                   },
//                 ],
//               },
//             },
//             {
//               name: "multiple-choice",
//               id: "fd1c89f",
//               attributes: {
//                 required: true,
//                 multiple: false,
//                 verticalAlign: false,
//                 label: "What is your company's current funding stage?",
//                 choices: [
//                   {
//                     label: "Pre-seed",
//                     value: "pre-seed",
//                   },
//                   {
//                     label: "Seed",
//                     value: "seed",
//                   },
//                   {
//                     label: "Series A",
//                     value: "series-a",
//                   },
//                   {
//                     label: "Series B",
//                     value: "series-b",
//                   },
//                   {
//                     label: "Later Stage",
//                     value: "later-stage",
//                   },
//                 ],
//               },
//             },
//             {
//               name: "short-text",
//               id: "gq0r94d",
//               attributes: {
//                 required: true,
//                 label: "What is your company's industry focus?",
//               },
//             },
//             {
//               name: "long-text",
//               id: "eb239dk",
//               attributes: {
//                 required: true,
//                 label:
//                   "What are your enterprise's objectives for the next 2-3 years?",
//                 placeholder:
//                   "Please describe your company's growth targets, expansion plans, or any other major objectives.",
//               },
//             },
//             {
//               name: "file-upload",
//               id: "ud73bsw",
//               attributes: {
//                 required: true,
//                 label: "Please upload the resumes of your development team.",
//                 description: "You can upload multiple files.",
//                 multiple: true,
//               },
//             },
//           ],
//         }}
//         applyLogic={true}
//         onSubmit={(
//           data,
//           { completeForm, setIsSubmitting, goToBlock, setSubmissionErr }
//         ) => {
//           setTimeout(() => {
//             completeForm();
//             setIsSubmitting(false);
//             router.push("/teamAnalysisReport");
//           }, 500);
//         }}
//       />
//     </div>
//   );
// };

// export default EnterpriseSolution;







import { Form } from "@quillforms/renderer-core";
import "@quillforms/renderer-core/build-style/style.css";
import { registerCoreBlocks } from "@quillforms/react-renderer-utils";
import { useRouter } from "next/router";

// Define the interface for form data
interface FormData {
  [key: string]: any; // Adjust this based on your actual form data structure
}

interface FormSubmitParams {
  completeForm: () => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  goToBlock: (blockId: string) => void;
  setSubmissionErr: (error: string) => void;
}

registerCoreBlocks();

const EnterpriseSolution = () => {
  const router = useRouter();

  const validateFormData = (data: FormData): boolean => {
    // Add your validation logic here
    return true;
  };

  const handleSubmit = async (
    data: FormData,
    { completeForm, setIsSubmitting, goToBlock, setSubmissionErr }: FormSubmitParams
  ) => {
    console.log("Form data submitted:", data);

    setIsSubmitting(true); // Start the submitting state

    if (validateFormData(data)) {
      try {
        // Send form data to the API route for processing
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
        console.log("Analysis result:", result);

        completeForm(); // Mark the form as completed
        setIsSubmitting(false); // Stop the submitting state

        // Navigate to TeamAnalysisReport and pass the analysis result as query parameters
        router.push({
          pathname: "/teamAnalysisReport",
          query: { analysisData: JSON.stringify(result) }
        });
      } catch (error) {
        console.error("Error submitting form:", error);
        setSubmissionErr("Error submitting the form. Please try again.");
        setIsSubmitting(false); // Stop the submitting state
      }
    } else {
      setSubmissionErr("Form validation failed. Please check your inputs.");
      setIsSubmitting(false); // Stop the submitting state
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Form
        formId={1}
        formObj={{
          blocks: [
            {
              name: "welcome-screen",
              id: "jg1401r",
              attributes: {
                label: "JobSense's Enterprise Solution",
                description: "Empowering Your Workforce, Driving Your Success.",
                attachment: {
                  type: "image",
                  url: "https://vajvudbmcgzbyivvtlvy.supabase.co/storage/v1/object/public/aaa/4207-ai-1-removebg-preview%20(1).jpg",
                },
              },
            },
            {
              name: "short-text",
              id: "kd12edg",
              attributes: {
                classnames: "first-block",
                required: true,
                label: "What is the name of your company?",
              },
            },
            {
              name: "multiple-choice",
              id: "gqr1294c",
              attributes: {
                required: true,
                multiple: false,
                verticalAlign: false,
                label: "How many developers are there in your team?",
                choices: [
                  { label: "1-5", value: "1-5" },
                  { label: "6-10", value: "6-10" },
                  { label: "11-20", value: "11-20" },
                  { label: "20+", value: "20+" },
                ],
              },
            },
            {
              name: "multiple-choice",
              id: "fd1c89f",
              attributes: {
                required: true,
                multiple: false,
                verticalAlign: false,
                label: "What is your company's current funding stage?",
                choices: [
                  { label: "Pre-seed", value: "pre-seed" },
                  { label: "Seed", value: "seed" },
                  { label: "Series A", value: "series-a" },
                  { label: "Series B", value: "series-b" },
                  { label: "Later Stage", value: "later-stage" },
                ],
              },
            },
            {
              name: "short-text",
              id: "gq0r94d",
              attributes: {
                required: true,
                label: "What is your company's industry focus?",
              },
            },
            {
              name: "long-text",
              id: "eb239dk",
              attributes: {
                required: true,
                label: "What are your enterprise's objectives for the next 2-3 years?",
                placeholder: "Please describe your company's growth targets, expansion plans, or any other major objectives.",
              },
            },
            {
              name: "file-upload",
              id: "ud73bsw",
              attributes: {
                required: false,
                label: "Please upload the resumes of your development team.",
                description: "You can upload multiple files.",
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

