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
        <Text mb={3}>Upload your resume to complete the submission.</Text>

        {!resumeUploaded ? (
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
              direction={{ base: 'column', md: 'row' }}
              alignItems="center"
              justifyContent="flex-start"
            >
              <Icon as={CheckCircleIcon} color="green.500" boxSize={6} mr={2} />
              <Text color="green.500">Resume Uploaded</Text>
            </Flex>
          </Flex>
        )}

        {/* Buttons */}
        <Flex gap={4} alignItems="center">
          <Button
            bg={buttonColor}
            color={buttonTextColor}
            _hover={{ bg: useColorModeValue('blue.600', 'blue.400') }}
            onClick={onSubmitRole}
            isDisabled={lockUpload || !resumeUploaded}
          >
            Submit
          </Button>
          <Button
            bg="red.500"
            color="white"
            _hover={{ bg: 'red.600' }}
            onClick={onReturnToUpload}
          >
            Return to Role Selection
          </Button>
        </Flex>
      </>
    </Box>
  );
};

export default ResumeCard;
