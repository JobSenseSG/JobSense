import React, { useEffect, useState, useRef } from 'react';
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
  Link,
  keyframes,
} from '@chakra-ui/react';
import { FiUpload } from 'react-icons/fi';
import { MdBuild, MdLock } from 'react-icons/md';
import SkillCard from '../components/SkillCard';
import ResumeCard from '../components/ResumeCard';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';
import { ArrowForwardIcon, CheckCircleIcon } from '@chakra-ui/icons';
import 'pdfjs-dist/legacy/build/pdf.worker';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';
import { User } from '@supabase/supabase-js';

interface CertificationComparisonResult {
  certification1_demand: string;
  certification2_demand: string;
  certification1_pay_range: string;
  certification2_pay_range: string;
  certification1_top_jobs: string[];
  certification2_top_jobs: string[];
}

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
`;

const DashboardPage = () => {
  const bounceAnimation = `${bounce} 2s ease-in-out infinite`;
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const buttonColor = '#7E00FB';
  const GradientText = chakra(Text, {
    baseStyle: {
      bgClip: 'text',
      bgGradient: 'linear(to-r, #7E00FB, #4B0095)',
      fontWeight: 'bold',
    },
  });
  const [isTextReady, setIsTextReady] = useState(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [latestRole, setLatestRole] = useState('');
  const linkColor = useColorModeValue('black', 'white');
  const [selectedJobs, setSelectedJobs] = useState<any[]>([]);

  const [skillsToLearn1Title, setSkillsToLearn1Title] = useState<string>('');
  const [skillsToLearn1Points, setSkillsToLearn1Points] = useState<string>('');

  const [skillsToLearn2Title, setSkillsToLearn2Title] = useState<string>('');
  const [skillsToLearn2Points, setSkillsToLearn2Points] = useState<string>('');

  const [skillsToLearn3Title, setSkillsToLearn3Title] = useState<string>('');
  const [skillsToLearn3Points, setSkillsToLearn3Points] = useState<string>('');
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSkills, setLoadingSkills] = useState<boolean>(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [jobs, setJobs] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [certification1, setCertification1] = useState<string | null>(null);
  const [certification2, setCertification2] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] =
    useState<CertificationComparisonResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [compareLoading, setCompareLoading] = useState<boolean>(false);
  const {
    isOpen: isResumeModalOpen,
    onOpen: onOpenResumeModal,
    onClose: onCloseResumeModal,
  } = useDisclosure();

  const shouldDisplayResults =
    resumeUploaded && selectedRole && !loading && !loadingSkills;

  const compatibilityColor = (percentage: number): string => {
    const hue = (percentage / 100) * 120;
    const lightness = 40;
    return `hsl(${hue}, 100%, ${lightness}%)`;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      OCRExtractor({ file: files[0] });
      setResumeUploaded(true);
    }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleUploadResume = () => {
    setResumeUploaded(true);
  };

  const OCRExtractor = async ({ file }: { file: File | null }) => {
    if (!file) {
      console.error('No file provided.');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('output_formats', JSON.stringify(['html']));
    formData.append('ocr', 'auto');
    formData.append('coordinates', 'true');

    try {
      const response = await fetch(
        'https://api.upstage.ai/v1/document-ai/document-parse',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer up_q4SzgaQKW3DyDNb8U7p75W33XsWLd',
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to parse the document.');
      }

      const data = await response.json();
      const extractedHtml = data.content.html;

      console.log('Extracted HTML:', extractedHtml);
      setText(extractedHtml);
    } catch (error) {
      console.error(
        'Error while extracting document using Document Parse:',
        error
      );
    }
  };

  const PDFExtractor = async ({ file }: { file: File | null }) => {
    if (!file) {
      console.error('No file provided.');
      return;
    }

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
              .map((item) => ('str' in item ? item.str : ''))
              .join(' ');
            extractedText += pageText + ' ';
          }

          setText(extractedText);
        } catch (error) {
          console.error('Error while extracting text from PDF:', error);
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSelectCertification = (
    value: string,
    setCertification: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    setCertification(value);
  };

  const handleReturnToUpload = () => {
    setResumeUploaded(false);
    setSelectedRole(null);
    setText('');
    setLoading(false);
    setLoadingSkills(false);
    setSubmitted(false);
    setJobs([]);
    setSkillsToLearn1Title('');
    setSkillsToLearn2Title('');
    setSkillsToLearn3Title('');
    setSkillsToLearn1Points('');
    setSkillsToLearn2Points('');
    setSkillsToLearn3Points('');
  };

  const handleCompare = async () => {
    if (!certification1 || !certification2) {
      console.error('Both certifications must be selected before comparing.');
      return;
    }

    setCompareLoading(true);

    try {
      const response = await fetch('/api/compareCertifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certification1,
          certification2,
        }),
      });

      const data = await response.json();

      console.log('API Response Data:', data);

      if (data.comparison) {
        const rows = data.comparison.match(/\|.*\|/g);

        const parsedTable =
          rows
            ?.map((row: any) => row.split('|').map((cell: any) => cell.trim()))
            .filter((row: any) => row.length > 1) || [];

        if (parsedTable.length >= 3) {
          const [header, separator, ...details] = parsedTable;

          setComparisonResult({
            certification1_demand: details[0][2],
            certification2_demand: details[1][2],
            certification1_pay_range: details[0][3],
            certification2_pay_range: details[1][3],
            certification1_top_jobs: details[0][4]
              .split(',')
              .map((job: any) => job.trim()),
            certification2_top_jobs: details[1][4]
              .split(',')
              .map((job: any) => job.trim()),
          });
        }
      } else {
        console.error('Missing certification details in the API response.');
      }

      setCompareLoading(false);
      onOpen();
    } catch (error) {
      console.error('Error comparing certifications:', error);
      setCompareLoading(false);
    }
  };

  const fetchSkillsToLearn = async (
    selectedRole: string,
    resumeText: string
  ) => {
    setLoadingSkills(true); // Show loading spinner during fetch

    const updatedPrompt = `
        I want to upskill to get a job as a ${selectedRole}. Here is my current skill set:
    
        ${resumeText}.
    
        Based on this skill set and the selected role, identify 3 distinct skills that I do not already know and would benefit from learning. Return each skill in the following format:
    
        1. Skill Title
        -----------------------
        (Reason for learning the skill roughly 3 sentences long).
    
        2. Skill Title
        -----------------------
        (Reason for learning the skill roughly 3 sentences long).
    
        3. Skill Title
        -----------------------
        (Reason for learning the skill roughly 3 sentences long).
    
        Ensure there is a clear separation between the title and the reason with a line of dashes.
    `;

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const response = await fetch('/api/skills-to-learn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ resumeText: updatedPrompt }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch skills to learn');
        }

        const skills = await response.json();
        console.log('Skills Suggested:', skills);

        if (skills.length >= 3) {
          setSkillsToLearn1Title(skills[0].title);
          setSkillsToLearn1Points(skills[0].points);
          setSkillsToLearn2Title(skills[1].title);
          setSkillsToLearn2Points(skills[1].points);
          setSkillsToLearn3Title(skills[2].title);
          setSkillsToLearn3Points(skills[2].points);
          break; // Exit retry loop if skills are fetched successfully
        } else {
          throw new Error('Insufficient skills returned');
        }
      } catch (error) {
        console.error('Error fetching skills to learn:', error);
        retryCount += 1;
        if (retryCount >= maxRetries) {
          console.error('Max retries reached. Failed to fetch skills.');
          clearSkills(); // Clear skills in case of failure
        }
      } finally {
        setLoadingSkills(false); // Stop loading once the API call is done
      }
    }
  };

  const analyzeResume = async (
    resumeText: string,
    selectedRole: string | null
  ) => {
    console.log('Resume Text being passed:', resumeText);
    console.log('Selected Role:', selectedRole);

    setLoading(true);
    const roleToAnalyze = selectedRole || '';
    const relatedRoles = await fetchRelatedRoles(roleToAnalyze);
    const analysis = [];

    for (let index = 0; index < relatedRoles.length; index++) {
      try {
        const response = await fetch('/api/useGemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resume: resumeText,
            role: relatedRoles[index],
          }),
        });

        const data = await response.json();
        console.log('Response from useGemini:', data);
        analysis.push(data);
      } catch (error) {
        console.error('Error analyzing resume:', error);
      }
    }

    setJobs(analysis);
    setLoading(false);
  };

  // Ensure that there is only one definition of the function
  const fetchSkillsToLearnForJob = async (job: any) => {
    setLoadingSkills(true);

    // Extract the top 3 skills directly from the job's skills_required field
    const requiredSkills = job.role.skills_required.slice(0, 3);

    const updatedPrompt = `
        I want to upskill for the following job:

        ${job.role.company} - ${job.role.title}.

        Here are the required skills for this job:

        ${requiredSkills.join(', ')}.

        Based on this skill set, provide insights into why these 3 skills are important and valuable for this role. Return in the following format:

        1. Skill Title
        -----------------------
        (Reason for learning the skill roughly 3 sentences long).

        2. Skill Title
        -----------------------
        (Reason for learning the skill roughly 3 sentences long).

        3. Skill Title
        -----------------------
        (Reason for learning the skill roughly 3 sentences long).

        Ensure that the reasoning is specific to these skills and the role in question.
    `;

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const response = await fetch('/api/skills-to-learn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ resumeText: updatedPrompt }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch skills insights.');
        }

        const skills = await response.json();
        console.log('Skills Insights Suggested:', skills);

        // Ensure valid skills data is returned
        if (skills && skills.length >= 3) {
          setSkillsToLearn1Title(skills[0].title);
          setSkillsToLearn1Points(skills[0].points);
          setSkillsToLearn2Title(skills[1].title);
          setSkillsToLearn2Points(skills[1].points);
          setSkillsToLearn3Title(skills[2].title);
          setSkillsToLearn3Points(skills[2].points);
          break; // Exit retry loop if skills are fetched successfully
        } else {
          throw new Error('Insufficient skills returned');
        }
      } catch (error) {
        retryCount += 1;
        console.error(
          `Attempt ${retryCount} - Error fetching skills insights for the job:`,
          error
        );

        if (retryCount >= maxRetries) {
          console.error('Max retries reached. Failed to fetch skills.');
          clearSkills(); // Clear skills in case of failure
          break;
        } else {
          await new Promise((res) => setTimeout(res, 1000 * retryCount)); // Exponential backoff delay
        }
      } finally {
        setLoadingSkills(false);
      }
    }
  };

  const clearSkills = () => {
    setSkillsToLearn1Title('');
    setSkillsToLearn1Points('');
    setSkillsToLearn2Title('');
    setSkillsToLearn2Points('');
    setSkillsToLearn3Title('');
    setSkillsToLearn3Points('');
  };

  const handleJobSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    job: any
  ) => {
    if (e.target.checked) {
      // Clear previously selected jobs and set the new job
      setSelectedJobs([job]);

      try {
        // Fetch the skills for the selected job and ensure it completes successfully
        await fetchSkillsToLearnForJob(job);
      } catch (error) {
        console.error('Error fetching skills for the job:', error);
        clearSkills(); // Clear skills if there's an error
      }
    } else {
      // If unchecked, clear the selection and clear skills
      setSelectedJobs([]);
      clearSkills();
    }
  };

  const handleSubmitRole = async () => {
    if (resumeUploaded && selectedRole && text) {
      setLoading(true);
      setLoadingSkills(true);
      setSubmitted(true);

      try {
        // Ensure analyzeResume completes before moving to fetchSkillsToLearn
        await analyzeResume(text, selectedRole);

        // Ensure fetchSkillsToLearn completes after analyzeResume
        await fetchSkillsToLearn(selectedRole, text);
      } catch (error) {
        console.error(
          'Error during resume analysis or skills fetching:',
          error
        );
      } finally {
        // Ensure the loading states are only updated once everything is complete

        setLoading(false); // Disable the overall loading state
        setLoadingSkills(false); // Disable the skills loading state
      }
    } else {
      console.error('Resume or Role is missing.');
    }
  };

  const fetchRelatedRoles = async (role: string) => {
    const relatedRolesResponse = await fetch('/api/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: role }),
    }).then((res) => res.json());

    return relatedRolesResponse;
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
      }

      if (!data.session) {
        router.push('/auth/signin');
      } else {
        setUser(data.session.user);
      }
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    const roles = [
      'Software Engineer',
      'Data Scientist',
      'Product Manager',
      'DevOps Engineer',
      'UX Designer',
    ];
    setAvailableRoles(roles);
  }, []);

  useEffect(() => {
    if (isTextReady && text && selectedRole) {
      analyzeResume(text, selectedRole);
      fetchSkillsToLearn(selectedRole, text);
      setIsTextReady(false);
    }
  }, [isTextReady, text, selectedRole]);

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const response = await fetch('/api/certification');
        const result = await response.json();

        const certNames = result.certifications.map((cert: any) => cert.name);
        setCertifications(certNames);

        console.log('Certification Names:', certNames);
      } catch (error) {
        console.error('Error fetching certification data:', error);
      }
    };

    fetchCertifications();
  }, []);

  if (!user) {
    return (
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
    );
  }

  return (
    <Box p={5}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Flex justifyContent="flex-start" alignItems="center">
          <Image src="/logo.png" alt="Logo" boxSize="50px" mr={2} />
          <Link href="/">
            <GradientText fontSize="2xl">JobSense</GradientText>
          </Link>
        </Flex>
        {/* Settings Button with Bounce Animation */}
        <Link href="/enterpriseSolution">
          <Button
            rightIcon={<ArrowForwardIcon />}
            colorScheme="green"
            variant="solid"
            animation={bounceAnimation}
          >
            Try our B2B feature now!
          </Button>
        </Link>
      </Flex>
      <Grid templateColumns={{ md: '1fr 2fr' }} gap={6}>
        <VStack spacing={4} align="stretch" width="full">
          <ResumeCard
            resumeUploaded={resumeUploaded}
            onFileSelect={handleFileSelect}
            onRoleSelect={handleRoleSelect}
            onSubmitRole={handleSubmitRole}
            availableRoles={availableRoles}
            selectedRole={selectedRole}
            onReturnToUpload={handleReturnToUpload}
          />
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
                  <option key={index} value={certification}>
                    {certification}
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
                isDisabled={compareLoading}
              >
                {compareLoading ? <Spinner size="sm" /> : 'Compare'}
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
            flex={1}
            height="400px" // Fix height for Job Qualification Scale section
          >
            <Flex justifyContent="space-between" alignItems="center">
              <GradientText mb={2} fontSize="xl">
                Job Qualification Scale
              </GradientText>
            </Flex>

            <Text mb={3}>
              {resumeUploaded && selectedRole && !submitted
                ? 'Upload your resume and select a role to analyze job qualifications.'
                : 'Upload your resume and select a role to analyze job qualifications.'}
            </Text>

            {loading ? (
              <Center>
                <Spinner size="xl" />
              </Center>
            ) : !resumeUploaded ? (
              // Locked Content UI for Job Qualification Scale when no resume is uploaded
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
                  Upload your resume and select a role to begin.
                </Text>
              </Flex>
            ) : (
              // Show the TableContainer with jobs if resume is uploaded
              <TableContainer
                height="100%" // TableContainer takes full height of the Box
                maxHeight="300px" // Max height to control overflow
                overflowY="auto" // Allow vertical scrolling for large content
              >
                <Table variant="simple" size="sm" width="full">
                  <Thead position="sticky" top="0" bg="white" zIndex="sticky">
                    <Tr>
                      <Th textAlign="left">Select</Th>
                      <Th textAlign="left">Company - Job Title</Th>
                      <Th textAlign="left">Compatibility</Th>
                      <Th textAlign="left">Skills Required</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {jobs.map((job, index) => (
                      <Tr key={index}>
                        <Td>
                          <input
                            type="checkbox"
                            checked={selectedJobs.includes(job)} // Maintain checkbox state
                            onChange={(e) => handleJobSelect(e, job)}
                          />
                        </Td>
                        <Td whiteSpace="normal" wordBreak="break-word">
                          {job?.role?.company ? (
                            <Text textAlign="left" noOfLines={[1, 2, 3]}>
                              {job.role.job_url ? (
                                <Link
                                  href={job.role.job_url}
                                  isExternal
                                  color={linkColor}
                                >
                                  {`${job.role.company} - ${job.role.title}`}
                                </Link>
                              ) : (
                                `${job.role.company} - ${job.role.title}`
                              )}
                            </Text>
                          ) : (
                            'N/A'
                          )}
                        </Td>
                        <Td textAlign="left">
                          <Text
                            color={compatibilityColor(job.compatibility)}
                            fontWeight="bold"
                          >
                            {/* Ensure compatibility is at least 10% */}
                            {Math.max(job.compatibility || 10, 10)}%
                          </Text>
                        </Td>
                        <Td whiteSpace="normal" wordBreak="break-word">
                          {job?.role?.skills_required?.join(', ') || 'N/A'}
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
                {submitted && resumeUploaded && selectedRole
                  ? 'Suggested Skills to Learn:'
                  : 'Upload your resume, select a role, and click submit to get skill recommendations.'}
              </Text>

              {/* Show Spinner when skills are loading */}
              {loadingSkills ? (
                <Center height="100px">
                  <Spinner size="lg" />
                </Center>
              ) : submitted && resumeUploaded && selectedRole ? (
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
                    Upload your resume and select a role to begin.
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
            <Text
              fontSize="xl"
              fontWeight="bold"
              mt={6}
              mb={4}
              textAlign="left"
            >
              Summary
            </Text>
            {comparisonResult && (
              <TableContainer>
                <Table variant="simple" size="sm" width="full">
                  <Thead>
                    <Tr>
                      <Th textAlign="center" whiteSpace="normal" width="50%">
                        {certification1}
                      </Th>
                      <Th textAlign="center" whiteSpace="normal" width="50%">
                        {certification2}
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td textAlign="center" whiteSpace="normal">
                        Certification Demand:{' '}
                        {comparisonResult.certification1_demand}
                      </Td>
                      <Td textAlign="center" whiteSpace="normal">
                        Certification Demand:{' '}
                        {comparisonResult.certification2_demand}
                      </Td>
                    </Tr>
                    <Tr>
                      <Td textAlign="center" whiteSpace="normal">
                        Pay Range: {comparisonResult.certification1_pay_range}
                      </Td>
                      <Td textAlign="center" whiteSpace="normal">
                        Pay Range: {comparisonResult.certification2_pay_range}
                      </Td>
                    </Tr>
                    <Tr>
                      <Td textAlign="center" whiteSpace="normal">
                        Top 3 Job Titles:{' '}
                        {comparisonResult.certification1_top_jobs.join(', ')}
                      </Td>
                      <Td textAlign="center" whiteSpace="normal">
                        Top 3 Job Titles:{' '}
                        {comparisonResult.certification2_top_jobs.join(', ')}
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DashboardPage;
