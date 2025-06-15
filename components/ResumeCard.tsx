import React, { useRef } from 'react';
import {
  Box,
  Text,
  Flex,
  chakra,
  Icon,
  useColorModeValue,
  Select,
  Button,
} from '@chakra-ui/react';
import { FiUpload } from 'react-icons/fi';
import { CheckCircleIcon } from '@chakra-ui/icons';

interface ResumeCardProps {
  resumeUploaded: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResumeClick?: () => void;
  onRoleSelect: (role: string) => void;
  onSubmitRole: () => void;
  availableRoles: string[];
  selectedRole: string | null;
  onReturnToUpload: () => void;
  lockUpload?: boolean;
  resumeText?: string;
  onReupload?: () => void;
}

const ResumeCard: React.FC<ResumeCardProps> = ({
  resumeUploaded,
  onFileSelect,
  onResumeClick,
  onRoleSelect,
  onSubmitRole,
  availableRoles,
  selectedRole,
  onReturnToUpload,
  lockUpload = false,
  resumeText,
  onReupload,
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const buttonColor = useColorModeValue('blue.500', 'blue.300');
  const buttonTextColor = useColorModeValue('white', 'gray.800');

  const GradientText = chakra(Text, {
    baseStyle: {
      bgClip: 'text',
      bgGradient: 'linear(to-r, #7E00FB, #4B0095)',
      fontWeight: 'bold',
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReupload = () => {
    onReupload?.();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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
      onClick={resumeUploaded ? onResumeClick : undefined}
    >
      <GradientText mb={2} fontSize="xl">
        Select a Role & Upload Your Resume
      </GradientText>
      <Text mb={3}>Please select the role you&apos;re interested in.</Text>

      {/* Role Selection */}
      <Select
        placeholder="Select a role"
        width="full"
        value={selectedRole || ''}
        onChange={(e) => onRoleSelect(e.target.value)}
      >
        {availableRoles.map((role, index) => (
          <option key={index} value={role}>
            {role}
          </option>
        ))}
      </Select>

      <>
        <GradientText mb={2} fontSize="xl">
          Upload Resume
        </GradientText>
        <Text mb={3}>
          {resumeText
            ? 'You have already uploaded a resume. You can upload a new one if needed.'
            : 'Upload your resume to complete the submission.'}
        </Text>

        {!resumeText ? (
          <Box
            as="label"
            htmlFor="file-upload"
            display="block"
            borderWidth="2px"
            borderStyle="dashed"
            borderColor={borderColor}
            borderRadius="lg"
            p={5}
            mb={6}
            transition="all 0.24s ease-in-out"
            _hover={{
              bg: useColorModeValue('gray.100', 'gray.600'),
              borderColor: useColorModeValue('gray.300', 'gray.500'),
            }}
            cursor={lockUpload ? 'not-allowed' : 'pointer'}
            textAlign="center"
            opacity={lockUpload ? 0.6 : 1}
          >
            <Icon as={FiUpload} w={12} h={12} mb={3} />
            <Text>Drag & Drop your files here</Text>
            <input
              id="file-upload"
              type="file"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={onFileSelect}
              accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              disabled={lockUpload}
            />
          </Box>
        ) : (
          <Flex direction="column" mb={6}>
            <Flex
              direction={{ base: 'column', sm: 'row' }}
              align="center"
              justify="space-between"
              gap={3}
              bg={useColorModeValue('green.50', 'green.900')}
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor={useColorModeValue('green.200', 'green.700')}
              wrap="wrap"
            >
              <Flex align="center" gap={2}>
                <CheckCircleIcon color="green.500" boxSize={5} />
                <Text color="green.600" fontWeight="medium">
                  Resume Uploaded Successfully
                </Text>
              </Flex>
              <Button
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={handleReupload}
                leftIcon={<FiUpload />}
              >
                Upload New Resume
              </Button>
            </Flex>
          </Flex>
        )}
      </>
    </Box>
  );
};

export default ResumeCard;
