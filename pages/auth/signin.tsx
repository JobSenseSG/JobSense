import { createClient } from '@supabase/supabase-js';
import {
  Box,
  Button,
  Text,
  VStack,
  chakra,
  Flex,
  Divider,
} from '@chakra-ui/react';
import { FaGoogle, FaLinkedin } from 'react-icons/fa'; // Import LinkedIn icon

// Initialize the Supabase client
const supabaseUrl = 'https://vajvudbmcgzbyivvtlvy.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhanZ1ZGJtY2d6YnlpdnZ0bHZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMDc1MzE5MCwiZXhwIjoyMDM2MzI5MTkwfQ.sc52sU-m0JUnP9EtnHTPb2tnQ-Gl9us0VTHmRHgnvlw';

const supabase = createClient(supabaseUrl, supabaseKey);

const GradientText = chakra(Text, {
  baseStyle: {
    bgClip: 'text',
    bgGradient: 'linear(to-r, #6A00F4, #BF00FF, #FF006E)',
    fontWeight: 'bold',
    display: 'inline',
  },
});

const SignIn: React.FC = () => {
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error('Error signing in:', error.message);
    } else {
      console.log('Redirecting to:', data.url);
    }
  };

  const signInWithLinkedIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin',
    });

    if (error) {
      console.error('Error signing in:', error.message);
    } else {
      console.log('Redirecting to:', data.url);
    }
  };

  return (
    <Flex
      height="100vh"
      width="100vw"
      bg="#121212"
      color="white"
      overflow="hidden"
    >
      <Flex
        direction="column"
        justifyContent="center"
        alignItems="center"
        width="50%"
        height="100%"
        zIndex="2"
        position="relative"
      >
        <GradientText fontSize="4xl" textAlign="center" mb={6}>
          JobSense
        </GradientText>

        <Box
          p={8}
          bg="#1A1A1A"
          borderRadius="md"
          boxShadow="lg"
          width="80%"
          maxWidth="400px"
        >
          <VStack spacing={4} mt={6}>
            <Button
              leftIcon={<FaGoogle />}
              onClick={signInWithGoogle}
              width="100%"
              sx={{
                border: '2px solid',
                borderImageSlice: 1,
                borderImageSource:
                  'linear-gradient(to right, #6A00F4, #BF00FF, #FF006E)',
                borderRadius: '12px',
                backgroundColor: 'transparent',
                color: 'white',
                padding: '0.5rem 1rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease-in-out',
                _hover: {
                  backgroundColor:
                    'linear-gradient(to right, #6A00F4, #BF00FF, #FF006E)',
                  color: 'white',
                  borderRadius: '12px',
                  boxShadow: '0px 0px 15px rgba(106, 0, 244, 0.7)',
                },
              }}
            >
              Sign in with Google
            </Button>

            <Flex align="center" width="100%">
              <Divider color="gray.600" />
              <Text mx={2} color="gray.500">
                OR
              </Text>
              <Divider color="gray.600" />
            </Flex>

            <Button
              leftIcon={<FaLinkedin />}
              onClick={signInWithLinkedIn}
              width="100%"
              sx={{
                border: '2px solid',
                borderImageSlice: 1,
                borderImageSource:
                  'linear-gradient(to right, #0A66C2, #0077B5)',
                borderRadius: '12px',
                backgroundColor: 'transparent',
                color: 'white',
                padding: '0.5rem 1rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease-in-out',
                _hover: {
                  backgroundColor:
                    'linear-gradient(to right, #0A66C2, #0077B5)',
                  color: 'white',
                  borderRadius: '12px',
                  boxShadow: '0px 0px 15px rgba(10, 102, 194, 0.7)',
                },
              }}
            >
              Sign in with LinkedIn
            </Button>

            {/* You can add other authentication methods or remove this block if not needed */}
          </VStack>
        </Box>
      </Flex>

      {/* Right Side with Design */}
      <Box
        width="50%"
        height="100%"
        zIndex="1"
        backgroundImage="url('/sign-in-background.png')"
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        clipPath="polygon(10% 0%, 100% 0, 100% 100%, 0% 100%)"
      />
    </Flex>
  );
};

export default SignIn;
