import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  VStack,
  Text,
  Button,
  Select,
  Grid,
  useColorModeValue,
  Flex,
  Image,
  Icon,
  chakra,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { FiUpload } from "react-icons/fi";
import { MdLock } from "react-icons/md";
import SkillCard from "../components/SkillCard";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import { CheckCircleIcon } from "@chakra-ui/icons";
import "pdfjs-dist/legacy/build/pdf.worker";

interface Certification {
  certificate_title: string;
  certification_demand: string;
  pay_range: string;
  top_3_job_titles: string[];
}

const DashboardPage = () => {
  const bgColor = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const buttonColor = "#7E00FB";
  const GradientText = chakra(Text, {
    baseStyle: {
      bgClip: "text",
      bgGradient: "linear(to-r, #7E00FB, #4B0095)",
      fontWeight: "bold",
    },
  });

  const [skillsToLearn1Title, setSkillsToLearn1Title] = useState<string>("");
  const [skillsToLearn1Points, setSkillsToLearn1Points] = useState<string>("");

  const [skillsToLearn2Title, setSkillsToLearn2Title] = useState<string>("");
  const [skillsToLearn2Points, setSkillsToLearn2Points] = useState<string>("");

  const [skillsToLearn3Title, setSkillsToLearn3Title] = useState<string>("");
  const [skillsToLearn3Points, setSkillsToLearn3Points] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSkills, setLoadingSkills] = useState<boolean>(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [jobs, setJobs] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [text, setText] = useState("");
  const [certification1, setCertification1] = useState<Certification | null>(
    null
  );
  const [certification2, setCertification2] = useState<Certification | null>(
    null
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const {
    isOpen: isResumeModalOpen,
    onOpen: onOpenResumeModal,
    onClose: onCloseResumeModal,
  } = useDisclosure();

  const compatibilityColor = (percentage: number): string => {
    const hue = (percentage / 100) * 120;
    return `hsl(${hue}, 100%, 50%)`;
  };

  // const parseSkill = (skillString: string) => {
  //   const match = skillString.match(/"(.*)".*?---------------------\s*(.*)/s);

  //   let title = "";
  //   let points = "";

  //   if (match) {
  //     title = match[1].trim();
  //     points = match[2].trim();
  //   } else {
  //     // In case the parsing fails, just use the string directly
  //     title = skillString.trim();
  //     points = "No additional information provided.";
  //   }

  //   // Remove the "Title: " prefix if present
  //   if (title.toLowerCase().startsWith("title:")) {
  //     title = title.substring(6).trim(); // Remove the first 6 characters ("Title:")
  //   }

  //   return { title, points };
  // };

  const certifications12 = [
    {
      certificate_title: "AWS Certified Solutions Architect",
      certification_demand: "High",
      pay_range: "$130,000 - $150,000",
      top_3_job_titles: [
        "Solutions Architect",
        "Cloud Architect",
        "Cloud Engineer",
      ],
    },
    {
      certificate_title: "Certified Kubernetes Administrator (CKA)",
      certification_demand: "High",
      pay_range: "$120,000 - $140,000",
      top_3_job_titles: [
        "DevOps Engineer",
        "Kubernetes Administrator",
        "Site Reliability Engineer",
      ],
    },
    {
      certificate_title: "Certified ScrumMaster (CSM)",
      certification_demand: "Moderate",
      pay_range: "$90,000 - $110,000",
      top_3_job_titles: ["Scrum Master", "Agile Coach", "Project Manager"],
    },
    {
      certificate_title: "Microsoft Certified: Azure Developer Associate",
      certification_demand: "High",
      pay_range: "$110,000 - $130,000",
      top_3_job_titles: [
        "Azure Developer",
        "Cloud Developer",
        "Software Engineer",
      ],
    },
  ];

  const handleUploadResume = () => {
    setResumeUploaded(true);
  };

  const PDFExtractor = async ({ file }: { file: File | null }) => {
    setLoadingSkills(true);
    if (!file) {
      console.error("No file provided.");
      return;
    }

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

          setText(extractedText); // Save extracted text to state
          analyzeResume(extractedText);
          fetchSkillsToLearn(extractedText);
        } catch (error) {
          console.error("Error while extracting text from PDF:", error);
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSelectCertification = (value: any, setCertification: any) => {
    // Find the certification object based on the title selected
    const selectedCert = certifications12.find(
      (cert) => cert.certificate_title === value
    );
    // Set the state with the selected certification object
    setCertification(selectedCert);
  };

  // This function is triggered when the "Compare" button is clicked
  const handleCompare = async () => {
    const certification1 = certifications12[0]; // AWS Certified Solutions Architect
    const certification2 = certifications12[1]; // Certified Kubernetes Administrator (CKA)

    try {
      const response = await fetch("/api/compareCertifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          certification1: certification1.certificate_title,
          certification2: certification2.certificate_title,
        }),
      });

      const data = await response.json();
      console.log("Comparison Result:", data);
      onOpen();
    } catch (error) {
      console.error("Error comparing certifications:", error);
    }
  };

  const fetchSkillsToLearn = async (resumeText: string) => {
    try {
      const response = await fetch("/api/skills-to-learn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeText }), // Passing resumeText to the API
      });

      if (!response.ok) {
        throw new Error("Failed to fetch skills to learn");
      }

      const skills = await response.json();

      // Assuming the API returns an array of skills as { title: string; points: string; }
      if (skills.length >= 3) {
        setSkillsToLearn1Title(skills[0].title);
        setSkillsToLearn1Points(skills[0].points);

        setSkillsToLearn2Title(skills[1].title);
        setSkillsToLearn2Points(skills[1].points);

        setSkillsToLearn3Title(skills[2].title);
        setSkillsToLearn3Points(skills[2].points);
      }
      setLoadingSkills(false);
    } catch (error) {
      console.error("Error fetching skills to learn:", error);
      setLoadingSkills(false);
    }
  };

  const analyzeResume = async (resumeText: string) => {
    setLoading(true);
    // Get latest job from resume
    const latestRole = await fetch("/api/latestRole", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resume: resumeText }),
    }).then((res) => {
      return res.json();
    });

    // Get all rows with title similar to user's current role
    const relatedRoles = await fetch("/api/roles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "Software Engineer" }),
    }).then((res) => {
      return res.json();
    });

    const analysis = [];

    for (let index = 0; index < relatedRoles.length; index++) {
      // Assume you have a backend endpoint /api/analyze-resume
      try {
        const response = await fetch("/api/useGemini", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume: resumeText,
            role: relatedRoles[index],
          }),
        });
        const data = await response.json();
        analysis.push(data);
        console.log("Analysis Result:", data);
      } catch (error) {
        console.error("Error analyzing resume:", error);
      }
    }
    setJobs(analysis);
    setLoading(false);
  };

  const ResumeCard = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0 && files[0].type === "application/pdf") {
        setUploadedFile(files[0]);
        setLoading(true);
        setLoadingSkills(true);

        setTimeout(() => {
          const hardcodedJobs = [
            {
              role: {
                company: "TechCorp",
                title: "Software Engineer",
                skills_required: ["JavaScript", "React", "Node.js"],
              },
              compatibility: 85,
            },
            {
              role: {
                company: "InnovateX",
                title: "Frontend Developer",
                skills_required: ["HTML", "CSS", "JavaScript"],
              },
              compatibility: 75,
            },
            {
              role: {
                company: "CodeMakers",
                title: "Backend Developer",
                skills_required: ["Python", "Django", "REST APIs"],
              },
              compatibility: 80,
            },
            {
              role: {
                company: "CloudNet",
                title: "DevOps Engineer",
                skills_required: ["AWS", "Docker", "CI/CD"],
              },
              compatibility: 90,
            },
            {
              role: {
                company: "AI Innovations",
                title: "Machine Learning Engineer",
                skills_required: ["Python", "TensorFlow", "Data Science"],
              },
              compatibility: 88,
            },
          ];
          setJobs(hardcodedJobs);

          setSkillsToLearn1Title("Advanced React Patterns");
          setSkillsToLearn1Points(
            "Ketut should learn advanced React patterns such as compound components, render props, and higher-order components. These patterns will help Ketut build more reusable and maintainable UI components, which are essential in complex applications. By mastering these patterns, Ketut can improve the scalability and flexibility of the front-end architecture."
          );

          setSkillsToLearn2Title("TypeScript");
          setSkillsToLearn2Points(
            "Ketut should master TypeScript to write strongly-typed JavaScript, which will greatly improve code quality and maintainability. Learning TypeScript will also help Ketut catch errors early during development, reducing bugs in the production environment. As more companies adopt TypeScript, this skill will make Ketut a more competitive candidate for advanced development roles."
          );

          setSkillsToLearn3Title("GraphQL");
          setSkillsToLearn3Points(
            "Ketut should learn GraphQL to efficiently query and manipulate data in modern web applications. By using GraphQL, Ketut can enable more flexible and powerful API interactions, which will lead to better performance and user experience. This skill will also allow Ketut to work on cutting-edge projects that require optimized data fetching strategies."
          );

          setResumeUploaded(true);
          setLoading(false);
          setLoadingSkills(false);
        }, 8000);
      }
    };

    const LabelBox = chakra(Box, {
      shouldForwardProp: (prop) => !["htmlFor"].includes(prop),
    });

    return (
      <Box
        p={5}
        bg={bgColor}
        boxShadow="md"
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        textAlign="left"
        position="relative"
        onClick={resumeUploaded ? onOpenResumeModal : undefined}
      >
        <GradientText mb={2} fontSize="xl">
          Resume
        </GradientText>
        <Text mb={3}>Upload your resume</Text>
        {!resumeUploaded ? (
          <>
            <LabelBox
              as="label"
              htmlFor="file-upload"
              borderWidth={2}
              borderStyle="dashed"
              borderColor={borderColor}
              borderRadius="lg"
              p={10}
              transition="all 0.24s ease-in-out"
              _hover={{
                bg: useColorModeValue("gray.100", "gray.600"),
                borderColor: useColorModeValue("gray.300", "gray.500"),
              }}
              cursor="pointer"
              textAlign="center"
              m={0}
              width="100%"
              display="block"
            >
              <Icon as={FiUpload} w={12} h={12} mb={3} />
              <Text>Drag & Drop your files here</Text>
              <input
                id="file-upload"
                type="file"
                multiple
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={onFileSelect}
                accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              />
            </LabelBox>
          </>
        ) : (
          <Flex
            direction={{ base: "column", md: "row" }}
            alignItems="center"
            justifyContent="flex-start"
          >
            <Icon as={CheckCircleIcon} color="green.500" boxSize={6} mr={2} />
            <Text color="green.500">Resume Uploaded</Text>
          </Flex>
        )}
      </Box>
    );
  };

  useEffect(() => {
    fetch("/api/certification")
      .then((response) => response.json())
      .then((data) => {
        setCertifications(data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  return (
    <Box p={5}>
      <Flex justifyContent="flex-start" alignItems="center" mb={4}>
        <Image src="/logo.png" alt="Logo" boxSize="50px" mr={2} />
        <GradientText fontSize="2xl">JobSense</GradientText>
      </Flex>
      <Grid templateColumns={{ md: "1fr 2fr" }} gap={6}>
        <VStack spacing={4} align="stretch" width="full">
          <ResumeCard />
          <Box
            p={5}
            bg={bgColor}
            boxShadow="md"
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            flex={1}
          >
            <GradientText mb={2} fontSize="xl">
              Certification Insight
            </GradientText>
            <Text mb={3}>
              Compare your certifications against market demands
            </Text>
            <VStack spacing={3}>
              <Select
                placeholder="Select certification 1"
                width="full"
                onChange={(e) =>
                  handleSelectCertification(e.target.value, setCertification1)
                }
              >
                {certifications12.map((certifications12, index) => (
                  <option
                    key={index}
                    value={certifications12.certificate_title}
                  >
                    {certifications12.certificate_title}
                  </option>
                ))}
              </Select>
              <Select
                placeholder="Select certification 2"
                width="full"
                onChange={(e) =>
                  handleSelectCertification(e.target.value, setCertification2)
                }
              >
                {certifications12.map((certifications12, index) => (
                  <option
                    key={index}
                    value={certifications12.certificate_title}
                  >
                    {certifications12.certificate_title}
                  </option>
                ))}
              </Select>

              <Button
                backgroundColor={buttonColor}
                color="white"
                onClick={handleCompare}
                width="full"
              >
                Compare
              </Button>
            </VStack>
          </Box>
        </VStack>
        <VStack spacing={4} align="stretch" width="full">
          <Box
            p={5}
            bg={bgColor}
            boxShadow="md"
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            maxHeight="400px"
          >
            <Flex justifyContent="space-between" alignItems="center">
              <GradientText mb={2} fontSize="xl">
                Job Qualification Scale
              </GradientText>
            </Flex>
            <Text mb={3}>
              {resumeUploaded
                ? "Discover how your qualifications measure up to specific job requirements"
                : "Upload your resume to see how your qualifications measure up to specific job requirements"}
            </Text>
            {loading ? (
              <Center>
                <Spinner size="xl" />
              </Center>
            ) : (
              <TableContainer maxHeight="200px" overflowY="auto">
                <Table
                  variant="simple"
                  size="sm"
                  width="full"
                  sx={{ "th, td": { width: "1/3" } }}
                >
                  <Thead position="sticky" top="0" bg="white" zIndex="sticky">
                    <Tr>
                      <Th textAlign="left">Company - Job Title</Th>
                      <Th textAlign="left">Compatibility</Th>
                      <Th textAlign="left">Skills Required</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {jobs.map((job, index) => (
                      <Tr key={index}>
                        <Td whiteSpace="normal" wordBreak="break-word">
                          <Text textAlign="left" noOfLines={[1, 2, 3]}>
                            {job?.role?.company
                              ? `${job.role.company} - ${job.role.title}`
                              : "N/A"}
                          </Text>
                        </Td>
                        <Td textAlign="left">
                          <Text
                            color={compatibilityColor(job.compatibility)}
                            fontWeight="bold"
                          >
                            {job.compatibility
                              ? `${job.compatibility}%`
                              : "10%"}
                          </Text>
                        </Td>
                        <Td whiteSpace="normal" wordBreak="break-word">
                          <Text textAlign="left" noOfLines={[1, 2, 4]}>
                            {job?.role?.skills_required?.join(", ") || "N/A"}
                          </Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </Box>
          <VStack spacing={4} align="stretch" width="full">
            <Box
              p={5}
              bg={bgColor}
              boxShadow="md"
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              position="relative"
            >
              <GradientText mb={2} fontSize="xl">
                Skills Development
              </GradientText>
              <Text mb={3}>
                Discover personalized recommendations on how to advance your
                skillset for career growth
              </Text>
              {resumeUploaded ? (
                loadingSkills ? (
                  <Center height="100px">
                    <Spinner size="lg" />
                  </Center>
                ) : (
                  <>
                    <Text mb={3} fontWeight="semibold">
                      Suggested Skills to Learn:
                    </Text>
                    <Flex overflowX="auto" py={2}>
                      <Box minWidth="220px" flex="0 0 auto" mx={2}>
                        <SkillCard
                          title={skillsToLearn1Title}
                          points={skillsToLearn1Points}
                        />
                      </Box>
                      <Box minWidth="220px" flex="0 0 auto" mx={2}>
                        <SkillCard
                          title={skillsToLearn2Title}
                          points={skillsToLearn2Points}
                        />
                      </Box>
                      <Box minWidth="220px" flex="0 0 auto" mx={2}>
                        <SkillCard
                          title={skillsToLearn3Title}
                          points={skillsToLearn3Points}
                        />
                      </Box>
                    </Flex>
                  </>
                )
              ) : (
                <Flex
                  direction="column"
                  justify="center"
                  align="center"
                  height="100px"
                  border="1px dashed"
                  borderColor={borderColor}
                  borderRadius="md"
                  p={5}
                  position="relative"
                >
                  <Icon as={MdLock} w={8} h={8} color="gray.500" mb={2} />
                  <Text textAlign="center">Locked Content</Text>
                  <Text textAlign="center" fontSize="sm">
                    Upload Your Resume to Begin
                  </Text>
                </Flex>
              )}
            </Box>
          </VStack>
        </VStack>
      </Grid>
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <GradientText>Certification Insight</GradientText>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={4}></Grid>
            <Text
              fontSize="xl"
              fontWeight="bold"
              mt={6}
              mb={2}
              textAlign="left"
            >
              Summary
            </Text>
            <TableContainer>
              <Table
                variant="simple"
                size="sm"
                style={{ tableLayout: "fixed" }}
                marginBottom={4}
              >
                <Thead>
                  <Tr>
                    <Th
                      textAlign="center"
                      whiteSpace="normal"
                      wordBreak="break-word"
                    >
                      {certification1?.certificate_title || "Certification 1"}
                    </Th>
                    <Th
                      textAlign="center"
                      whiteSpace="normal"
                      wordBreak="break-word"
                    >
                      {certification2?.certificate_title || "Certification 2"}
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td whiteSpace="normal" wordBreak="break-word">
                      <Text textAlign="center" noOfLines={[1, 2, 3]}>
                        Certification Demand:{" "}
                        {certification1?.certification_demand || "N/A"}
                      </Text>
                    </Td>
                    <Td whiteSpace="normal" wordBreak="break-word">
                      <Text textAlign="center" noOfLines={[1, 2, 3]}>
                        Certification Demand:{" "}
                        {certification2?.certification_demand || "N/A"}
                      </Text>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td whiteSpace="normal" wordBreak="break-word">
                      <Text textAlign="center" noOfLines={[1, 2, 3]}>
                        Pay Range: {certification1?.pay_range || "N/A"}
                      </Text>
                    </Td>
                    <Td whiteSpace="normal" wordBreak="break-word">
                      <Text textAlign="center" noOfLines={[1, 2, 3]}>
                        Pay Range: {certification2?.pay_range || "N/A"}
                      </Text>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td whiteSpace="normal" wordBreak="break-word">
                      <Text textAlign="center" noOfLines={[2, 3, 4]}>
                        Top 3 Job Titles:{" "}
                        {certification1?.top_3_job_titles.join(", ") || "N/A"}
                      </Text>
                    </Td>
                    <Td whiteSpace="normal" wordBreak="break-word">
                      <Text textAlign="center" noOfLines={[2, 3, 4]}>
                        Top 3 Job Titles:{" "}
                        {certification2?.top_3_job_titles.join(", ") || "N/A"}
                      </Text>
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DashboardPage;
