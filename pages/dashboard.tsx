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
 const [certifications, setCertifications] = useState<string[]>([]);
  const [text, setText] = useState("");
const [certification1, setCertification1] = useState<string | null>(null);
const [certification2, setCertification2] = useState<string | null>(null);

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

          setText(extractedText);
          analyzeResume(extractedText);
          fetchSkillsToLearn(extractedText);
        } catch (error) {
          console.error("Error while extracting text from PDF:", error);
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };
const handleSelectCertification = (value: string, setCertification: React.Dispatch<React.SetStateAction<string | null>>) => {
  setCertification(value);
};


  const handleCompare = async () => {
    // if (!certification1 || !certification2) {
    //   console.error("Both certifications must be selected before comparing.");
    //   return;
    // }

    // try {
    //   const response = await fetch("/api/compareCertifications", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       certification1: certification1.certificate_title,
    //       certification2: certification2.certificate_title,
    //     }),
    //   });

    //   const data = await response.json();
    //   console.log("Comparison Result:", data);
    //   onOpen();
    // } catch (error) {
    //   console.error("Error comparing certifications:", error);
    // }
  };

  const fetchSkillsToLearn = async (resumeText: string) => {
    try {
      const response = await fetch("/api/skills-to-learn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeText }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch skills to learn");
      }

      const skills = await response.json();

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
    const latestRole = await fetch("/api/latestRole", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resume: resumeText }),
    }).then((res) => {
      return res.json();
    });

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
        PDFExtractor({ file: files[0] });
        setResumeUploaded(true);
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
  const fetchCertifications = async () => {
    try {
      const response = await fetch("/api/certification");
      const result = await response.json();

      // Extract certification names
      const certNames = result.certifications.map((cert: any) => cert.name);
      setCertifications(certNames);

      console.log("Certification Names:", certNames);
    } catch (error) {
      console.error("Error fetching certification data:", error);
    }
  };

  fetchCertifications();
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
  onChange={(e) => handleSelectCertification(e.target.value, setCertification1)}
>
  {certifications.map((certification, index) => (
    <option key={index} value={certification}>
      {certification}
    </option>
  ))}
</Select>

<Select
  placeholder="Select certification 2"
  width="full"
  onChange={(e) => handleSelectCertification(e.target.value, setCertification2)}
>
  {certifications.map((certification, index) => (
    <option key={index} value={certification}>
      {certification}
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
      {/* <Modal isOpen={isOpen} onClose={onClose} size="4xl">
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
      </Modal> */}
    </Box>
  );
};

export default DashboardPage;
