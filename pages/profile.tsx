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
import PDFReader from '../components/PDFReader';

const ProfilePage = () => {
  const [profile, setProfile] = useState({ name: '', email: '', bio: '' });
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
  const [initialProfile, setInitialProfile] = useState({ name: '', email: '' });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        setAvatarUrl(metadata.avatar_url || '');

        setProfile({
          name: session.user.user_metadata?.name || '',
          email: session.user.email || '',
          bio: '',
        });

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('full_name, email, goals, desired_roles, resume_text')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else if (profileData) {
          setProfile({
            name: profileData.full_name || '',
            email: profileData.email || '',
            bio: Array.isArray(profileData.goals)
              ? profileData.goals[0] || ''
              : '',
          });
          setInitialProfile({
            name: profileData.full_name || '',
            email: profileData.email || '',
          });
          if (
            profileData.desired_roles &&
            profileData.desired_roles.length > 0
          ) {
            setSelectedRole(profileData.desired_roles[0]);
          }
          if (profileData.resume_text) {
            setResumeText(profileData.resume_text);
            setResumeUploaded(true);
          }
        }
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
      setResumeUploaded(true);
    }
  };

  const handleResumeTextChange = (text: string) => {
    setResumeText(text);
    if (text.trim().length > 50) {
      setTimeout(() => {
        getCurrentRoleFromResume(text);
      }, 300);
    }
  };

  const getCurrentRoleFromResume = async (text: string) => {
    if (!text || !text.trim()) return;

    try {
      const response = await fetch('/api/get-current-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text }),
      });

      const data = await response.json();
      if (!response.ok || !data.roleTitle) {
        console.error('[ERROR] AI role detection failed:', data.error);
        return;
      }

      const currentRole = data.roleTitle.trim();
      setSelectedRole(currentRole);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) return console.error('Session error:', sessionError);

      const userId = session?.user?.id;
      if (!userId) return console.error('User ID missing');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ current_role: currentRole })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update current_role:', updateError);
      } else {
        console.log('[✅] current_role updated:', currentRole);
      }
    } catch (err) {
      console.error('Exception during role detection:', err);
    }
  };

  const handleReupload = () => {
    setResumeText('');
    setResumeUploaded(false);
    setUploadedFile(null);
  };

  const handleSaveAll = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return alert('You must be logged in.');

      const userId = session.user.id;
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: profile.name,
        email: profile.email,
        goals: [profile.bio],
        desired_roles: selectedRole ? [selectedRole] : [],
        resume_url: null,
        resume_text: resumeText?.trim() || null,
      });

      if (error) throw error;
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save profile.');
    }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleSubmitRole = () => {
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
    <>
      {/* Top Navigation */}
      <Box p={4}>
        <Button
          variant="link"
          colorScheme="purple"
          fontWeight="medium"
          onClick={() => (window.location.href = '/dashboard')}
        >
          ← Back to Dashboard
        </Button>
      </Box>

      {/* Main Profile Container */}
      <Container maxW="6xl" py={6}>
        <Flex direction={{ base: 'column', md: 'row' }} gap={8} align="stretch">
          {/* Resume Section */}
          <Box
            flex={{ base: 'unset', md: '1' }}
            p={6}
            bg={bg}
            borderRadius="2xl"
            border="1px solid"
            borderColor={border}
            boxShadow="xl"
          >
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
              resumeText={resumeText}
              onReupload={handleReupload}
            />
            {uploadedFile && (
              <Box display="none">
                <PDFReader
                  file={uploadedFile}
                  onTextExtracted={handleResumeTextChange}
                />
              </Box>
            )}
          </Box>

          {/* Profile Form */}
          <Box
            flex={{ base: 'unset', md: '2' }}
            p={8}
            bg={useColorModeValue('gray.50', 'gray.900')}
            borderRadius="2xl"
            border="1px solid"
            borderColor={border}
            boxShadow="xl"
          >
            <Flex alignItems="center" mb={6} gap={4}>
              <Avatar
                size="xl"
                name={initialProfile.name}
                src={avatarUrl}
                boxShadow="md"
                border="4px solid"
                borderColor="purple.400"
              />
              <Box>
                <GradientHeading size="lg" mb={1}>
                  {initialProfile.name || <Skeleton w="120px" h="24px" />}
                </GradientHeading>
                <Text color="gray.500" fontSize="md">
                  {profile.email || <Skeleton w="180px" h="18px" />}
                </Text>
              </Box>
            </Flex>

            <GradientHeading size="md" mb={5}>
              Profile Information
            </GradientHeading>

            <VStack spacing={5} align="stretch">
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  isDisabled={loading}
                  placeholder="Your name"
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
                  isDisabled={loading}
                  bg="gray.100"
                  _dark={{ bg: 'gray.700' }}
                  borderRadius="lg"
                  boxShadow="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Tell us about your goals</FormLabel>
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
            </VStack>
          </Box>
        </Flex>

        {/* Save Button */}
        <Flex justify="center" mt={10}>
          <Button
            colorScheme="purple"
            onClick={handleSaveAll}
            borderRadius="lg"
            size="lg"
            boxShadow="md"
            _hover={{ bg: 'purple.600' }}
          >
            Save Changes
          </Button>
        </Flex>
      </Container>
    </>
  );
};

export default ProfilePage;
