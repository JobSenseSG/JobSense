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
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [latestRole, setLatestRole] = useState('');
  const linkColor = useColorModeValue('black', 'white');

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

  const compatibilityColor = (percentage: number): string => {
    const hue = (percentage / 100) * 120;
    const lightness = 40;
    return `hsl(${hue}, 100%, ${lightness}%)`;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && files[0].type === 'application/pdf') {
      PDFExtractor({ file: files[0] });
      setResumeUploaded(true);
    }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleUploadResume = () => {
    setResumeUploaded(true);
  };

  const PDFExtractor = async ({ file }: { file: File | null }) => {
    setLoading(true);
    setLoadingSkills(true);
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
          fetchSkillsToLearn(extractedText);

          // Delay the analyzeResume call until the role is updated
          if (selectedRole) {
            analyzeResume(extractedText, selectedRole); // Call analyzeResume with the selected role
          } else {
            analyzeResume(extractedText, null); // If no role is selected, fallback to extracted role
          }
        } catch (error) {
          console.error('Error while extracting text from PDF:', error);
          setLoading(false);
          setLoadingSkills(false);
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
    setResumeUploaded(false); // Reset the state
    setSelectedRole(null); // Reset the selected role
    setText(''); // Clear extracted resume text
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

  const fetchSkillsToLearn = async (resumeText: string) => {
    try {
      const response = await fetch('/api/skills-to-learn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeText }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch skills to learn');
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
      setLoadingSkills(false); // Stop loading after skills data is fetched
    } catch (error) {
      console.error('Error fetching skills to learn:', error);
      setLoadingSkills(false); // Stop loading in case of an error
    }
  };

  const analyzeResume = async (
    resumeText: string,
    selectedRole: string | null
  ) => {
    setLoading(true); // Start loading for Job Qualification
    const roleToAnalyze = selectedRole || (await fetchLatestRole(resumeText));
    const relatedRoles = await fetchRelatedRoles(roleToAnalyze);
    const analysis = [];

    // Analyze resume against related roles
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
        analysis.push(data);
      } catch (error) {
        console.error('Error analyzing resume:', error);
      }
    }

    setJobs(analysis); // Update jobs state with analysis results
    setLoading(false); // Stop loading after job data is fetched
  };

  const handleSubmitRole = () => {
    if (text && selectedRole) {
      analyzeResume(text, selectedRole); // Trigger analysis when "Submit" button is clicked
    }
  };

  // Fetch latest role extracted from the resume
  const fetchLatestRole = async (resumeText: string) => {
    const latestRoleResponse = await fetch('/api/latestRole', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resume: resumeText }),
    }).then((res) => res.json());

    setLatestRole(latestRoleResponse.latestRole);
    return latestRoleResponse.latestRole;
  };

  // Fetch related roles for analysis
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
        // If no session, redirect to the sign-in page
        router.push('/auth/signin');
      } else {
        // If session exists, set the user
        setUser(data.session.user);
      }
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    // Mock available roles
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
    const fetchCertifications = async () => {
      try {
        const response = await fetch('/api/certification');
        const result = await response.json();

        // Extract certification names
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
            animation={bounceAnimation} // Add the bounce animation
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
            onRoleSelect={setSelectedRole}
            onSubmitRole={handleSubmitRole} // Submit handler passed to ResumeCard
            availableRoles={availableRoles}
            selectedRole={selectedRole} // Pass selected role
            onReturnToUpload={handleReturnToUpload} // Pass the return-to-upload handler
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
            maxHeight="400px"
          >
            <Flex justifyContent="space-between" alignItems="center">
              <GradientText mb={2} fontSize="xl">
                Job Qualification Scale
              </GradientText>
            </Flex>
            <Text mb={3}>
              {resumeUploaded
                ? 'Discover how your qualifications measure up to specific job requirements'
                : 'Upload your resume to see how your qualifications measure up to specific job requirements'}
            </Text>
            {loading ? (
              <Center>
                <Spinner size="xl" />
              </Center>
            ) : (
              <TableContainer maxHeight="200px" overflowY="auto">
                <Table variant="simple" size="sm" width="full">
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
                            {job.compatibility
                              ? `${job.compatibility}%`
                              : '10%'}
                          </Text>
                        </Td>
                        <Td whiteSpace="normal" wordBreak="break-word">
                          <Text textAlign="left" noOfLines={[1, 2, 4]}>
                            {job?.role?.skills_required?.join(', ') || 'N/A'}
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
