import { Form } from "@quillforms/renderer-core";
import "@quillforms/renderer-core/build-style/style.css";
import { registerCoreBlocks } from "@quillforms/react-renderer-utils";
import "./file-block";
import { useRouter } from "next/router";

registerCoreBlocks();

const EnterpriseSolution = () => {
  const router = useRouter();

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
                  {
                    label: "1-5",
                    value: "1-5",
                  },
                  {
                    label: "6-10",
                    value: "6-10",
                  },
                  {
                    label: "11-20",
                    value: "11-20",
                  },
                  {
                    label: "20+",
                    value: "20+",
                  },
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
                  {
                    label: "Pre-seed",
                    value: "pre-seed",
                  },
                  {
                    label: "Seed",
                    value: "seed",
                  },
                  {
                    label: "Series A",
                    value: "series-a",
                  },
                  {
                    label: "Series B",
                    value: "series-b",
                  },
                  {
                    label: "Later Stage",
                    value: "later-stage",
                  },
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
                required: false,
                label:
                  "What are your enterprise's objectives for the next 2-3 years?",
                placeholder:
                  "Please describe your company's growth targets, expansion plans, or any other major objectives.",
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
        onSubmit={(
          data,
          { completeForm, setIsSubmitting, goToBlock, setSubmissionErr }
        ) => {
          setTimeout(() => {
            completeForm();
            setIsSubmitting(false);
            router.push("/teamAnalysisReport");
          }, 500);
        }}
      />
    </div>
  );
};

export default EnterpriseSolution;
