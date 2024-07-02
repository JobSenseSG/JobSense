import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Select,
  Progress,
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
  const [skillsToLearn1, setSkillsToLearn1] = useState<any>("");
  const [skillsToLearn2, setSkillsToLearn2] = useState<any>("");
  const [skillsToLearn3, setSkillsToLearn3] = useState<any>("");
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

  const skills = [
    {
      title: `${skillsToLearn1.split("\n")[0]}`,
      description: "Why Learn it?",
      points: [`${skillsToLearn1.split("\n").slice(1).join("\n")}`],
    },
    {
      title: `${skillsToLearn2.split("\n")[0]}`,
      description: "Why Learn it?",
      points: [`${skillsToLearn2.split("\n").slice(1).join("\n")}`],
      outcome: "",
    },
    {
      title: `${skillsToLearn3.split("\n")[0]}`,
      description: "Why Learn it?",
      points: [`${skillsToLearn3.split("\n").slice(1).join("\n")}`],
      outcome: "",
    },
    // Add more skills as needed
  ];

  const handleUploadResume = () => {
    // Logic to handle resume upload will go here
    // For now, we'll just set the state to true
    setResumeUploaded(true);
  };

  const PDFExtractor = ({ file }: { file: File | null }) => {
    setLoadingSkills(true);
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
          console.log("Extracted Text:" + extractedText);
          // Assuming `setText` and `analyzeResume` are provided elsewhere
          // setText(extractedText);
          analyzeResume(extractedText);
          skillsToLearn(extractedText, "");
          const skillsData = await skillsToLearn(extractedText, "");
          const skillsData1 = await skillsToLearn(extractedText, skillsData);
          const skillsData2 = await skillsToLearn(extractedText, skillsData1);
          setSkillsToLearn1(skillsData);
          setSkillsToLearn2(skillsData1);
          setSkillsToLearn3(skillsData2);
          setLoadingSkills(false);
        } catch (error) {
          console.error("Error while extracting text from PDF:", error);
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSelectCertification = (value: any, setCertification: any) => {
    // Find the certification object based on the title selected
    const selectedCert = certifications.find(
      (cert) => cert.certificate_title === value
    );
    // Set the state with the selected certification object
    setCertification(selectedCert);
  };

  // This function is triggered when the "Compare" button is clicked
  const handleCompare = () => {
    // Check that both certifications have been selected
    if (certification1 && certification2) {
      console.log(
        "Comparing",
        certification1.certificate_title,
        "vs",
        certification2.certificate_title
      );
      onOpen(); // This should open the modal
    } else {
      console.log("Please select two certifications to compare");
      // Handle the case where one or both certifications haven't been selected
      // You might want to show an error message or alert to the user
    }
  };

  const skillsToLearn = async (resumeText: string, previousResponse: any) => {
    try {
      const response = await fetch("/api/skills-to-learn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeText, previousResponse }), // Updated field name to match backend
      });

      if (!response.ok) {
        throw new Error("Failed to fetch skills to learn");
      }

      const data = await response.text();
      console.log("Skills to learn:", data);
      return data; // Return the data if needed for further processing
    } catch (error) {
      console.error("Error fetching skills to learn:", error);
      // Handle the error gracefully, e.g., display an error message to the user
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
      body: JSON.stringify({ title: latestRole.latestRole }),
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

    // Handle files selected via input element
    const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0 && files[0].type === "application/pdf") {
        setUploadedFile(files[0]);
        PDFExtractor({ file: files[0] });
        console.log(text);
        setResumeUploaded(true);
        console.log("Uploaded:", files[0].name);
      }
    };

    // Handle files dropped onto the drop zone
    const onFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const files = event.dataTransfer.files;
      if (files.length > 0 && files[0].type === "application/pdf") {
        setUploadedFile(files[0]);
        setResumeUploaded(true);
        console.log("Dropped:", files[0].name);
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
        {/* <PDFReader file={uploadedFile} />  */}
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
        // Do something with the data
        console.log(data);
        setCertifications(data);
      })
      .catch((error) => {
        // Handle any errors here
        console.error("Error fetching data: ", error);
      });
  }, []);

  useEffect(() => {
    fetch("/api/data")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data); // Check the structure here
        // setJobs(data); // Assuming data is directly an array of Job objects
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
      {/* Updated Grid layout */}
      <Grid templateColumns={{ md: "1fr 2fr" }} gap={6}>
        {/* Left column (1/3 width) */}
        <VStack spacing={4} align="stretch" width="full">
          <ResumeCard />

          {/* Certification Insight Card */}
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
                {certifications.map((certification, index) => (
                  <option key={index} value={certification.certificate_title}>
                    {certification.certificate_title}
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
                {certifications.map((certification, index) => (
                  <option key={index} value={certification.certificate_title}>
                    {certification.certificate_title}
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
        {/* Right column (2/3 width) */}
        <VStack spacing={4} align="stretch" width="full">
          {/* Job Qualification Scale Card */}
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
                            {job.role.company} - {job.role.title}
                          </Text>
                        </Td>
                        <Td textAlign="left">
                          <Text
                            color={compatibilityColor(job.compatibility)}
                            fontWeight="bold"
                          >
                            {job.compatibility
                              ? `${job.compatibility}%`
                              : "N/A"}
                          </Text>
                        </Td>
                        <Td whiteSpace="normal" wordBreak="break-word">
                          <Text textAlign="left" noOfLines={[1, 2, 4]}>
                            {job.role.skills_required.join(", ") || "N/A"}
                          </Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </Box>
          {/* Skills Development Card */}
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
                    {" "}
                    {/* Adjust height as needed */}
                    <Spinner size="lg" />
                  </Center>
                ) : (
                  <>
                    <Text mb={3} fontWeight="semibold">
                      Suggested Skills to Learn:
                    </Text>
                    <Flex overflowX="auto" py={2}>
                      {skills.map((skill, index) => (
                        <Box
                          key={index}
                          minWidth="220px"
                          flex="0 0 auto"
                          mx={2}
                        >
                          <SkillCard
                            title={skill.title}
                            points={skill.points}
                          />
                        </Box>
                      ))}
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
      {/* Modal for showing comparison */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <GradientText>Certification Insight</GradientText>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={4}>
              {/* Dropdowns */}
              <Select
                value={certification1?.certificate_title || ""}
                placeholder="Select certification 1"
                onChange={(e) =>
                  handleSelectCertification(e.target.value, setCertification1)
                }
              >
                {certifications.map((cert) => (
                  <option
                    key={cert.certificate_title}
                    value={cert.certificate_title}
                  >
                    {cert.certificate_title}
                  </option>
                ))}
              </Select>
              <Select
                value={certification2?.certificate_title || ""}
                placeholder="Select certification 2"
                onChange={(e) =>
                  handleSelectCertification(e.target.value, setCertification2)
                }
              >
                {certifications.map((cert) => (
                  <option
                    key={cert.certificate_title}
                    value={cert.certificate_title}
                  >
                    {cert.certificate_title}
                  </option>
                ))}
              </Select>
            </Grid>
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
