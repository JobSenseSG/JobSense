import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Avatar,
  Button,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  Heading,
  VStack,
  useColorModeValue,
  Container,
  Skeleton,
  Text,
  Divider,
  chakra,
} from '@chakra-ui/react';
import { supabase } from '../utils/supabaseClient';
import ResumeCard from '../components/ResumeCard';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
  });
  const [loading, setLoading] = useState(true);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [availableRoles] = useState<string[]>([
    'Software Engineer',
    'Data Scientist',
    'Product Manager',
    'DevOps Engineer',
    'UX Designer',
  ]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Fetch user info from Supabase session
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setProfile({
          name: session.user.user_metadata?.name || '',
          email: session.user.email || '',
          bio: '', // You can fetch this from your DB if you store it
        });
      }
      setLoading(false);
    };
    getUser();
    setMounted(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Save profile to Supabase (implement this later)
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
      setResumeUploaded(true);
    }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleSubmitRole = () => {
    // Implement submit logic here
    alert(`Submitted role: ${selectedRole} with resume: ${uploadedFile?.name}`);
  };

  const handleReturnToUpload = () => {
    setResumeUploaded(false);
    setUploadedFile(null);
    setSelectedRole(null);
  };

  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.200', 'gray.700');

  const GradientHeading = chakra(Heading, {
    baseStyle: {
      bgClip: 'text',
      bgGradient: 'linear(to-r, #7E00FB, #4B0095)',
      fontWeight: 'bold',
    },
  });

  if (!mounted) return null;

  return (
    <Container maxW="4xl" py={10}>
      <Flex
        bg={bg}
        borderRadius="2xl"
        boxShadow="2xl"
        borderWidth="1px"
        borderColor={border}
        p={{ base: 4, md: 10 }}
        gap={10}
        direction={{ base: 'column', md: 'row' }}
        alignItems="flex-start"
      >
        {/* Left: Role & Resume Upload Section */}
        <VStack flex="1" spacing={8} align="stretch">
          <ResumeCard
            resumeUploaded={resumeUploaded}
            onFileSelect={handleFileSelect}
            onResumeClick={undefined}
            onRoleSelect={handleRoleSelect}
            onSubmitRole={handleSubmitRole}
            availableRoles={availableRoles}
            selectedRole={selectedRole}
            onReturnToUpload={handleReturnToUpload}
            lockUpload={!selectedRole}
          />
        </VStack>

        {/* Divider for desktop */}
        <Box display={{ base: 'none', md: 'block' }} h="auto" px={2}>
          <Divider orientation="vertical" borderColor={border} />
        </Box>

        {/* Right: Profile Form */}
        <Box
          flex="2"
          bg={useColorModeValue('gray.50', 'gray.900')}
          borderRadius="2xl"
          boxShadow="lg"
          p={{ base: 4, md: 8 }}
        >
          {/* Profile Card */}
          <Flex alignItems="center" mb={8} gap={4}>
            <Avatar
              size="xl"
              name={profile.name}
              src=""
              boxShadow="md"
              border="4px solid"
              borderColor="purple.400"
            />
            <Box>
              <GradientHeading size="lg" mb={1}>
                {profile.name || <Skeleton w="120px" h="24px" />}
              </GradientHeading>
              <Text color="gray.500" fontSize="md">
                {profile.email || <Skeleton w="180px" h="18px" />}
              </Text>
            </Box>
          </Flex>
          <GradientHeading size="md" mb={6}>
            Profile Information
          </GradientHeading>
          <VStack spacing={5} align="stretch">
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Your name"
                isDisabled={loading}
                borderRadius="lg"
                boxShadow="sm"
                _focus={{
                  borderColor: 'purple.400',
                  boxShadow: '0 0 0 1px #7E00FB',
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                value={profile.email}
                isReadOnly
                bg="gray.100"
                _dark={{ bg: 'gray.700' }}
                placeholder="Your email"
                isDisabled={loading}
                borderRadius="lg"
                boxShadow="sm"
              />
            </FormControl>
            <FormControl>
              <FormLabel>
                Tell us about your goals and aspirations for your career
              </FormLabel>
              <Textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                placeholder="I want to level up my skills as a..."
                rows={4}
                isDisabled={loading}
                borderRadius="lg"
                boxShadow="sm"
                _focus={{
                  borderColor: 'purple.400',
                  boxShadow: '0 0 0 1px #7E00FB',
                }}
              />
            </FormControl>
            <Button
              colorScheme="purple"
              onClick={handleSave}
              isDisabled={loading}
              borderRadius="lg"
              size="lg"
              boxShadow="md"
              _hover={{ bg: 'purple.600' }}
            >
              Save Changes
            </Button>
          </VStack>
        </Box>
      </Flex>
    </Container>
  );
};

export default ProfilePage;
