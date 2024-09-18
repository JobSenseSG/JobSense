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
      bgGradient="linear(to-r, #121212, #6A00F4)" // Gradient for background
      color="white"
      alignItems="center"
      justifyContent="center"
      position="relative"
    >
      {/* Background Image or Gradient */}
      <Box
        position="absolute"
        top="0"
        left="0"
        height="100%"
        width="100%"
        zIndex="1"
        backgroundImage="url('/sign-in-background.png')"
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        opacity="0.3" // Adds transparency to the background image
      />

      {/* Form Box */}
      <Box
        zIndex="2"
        p={8}
        bg="rgba(26, 26, 26, 0.85)" // Semi-transparent background
        borderRadius="lg"
        boxShadow="xl"
        width="100%"
        maxWidth="400px"
        textAlign="center"
      >
        <GradientText fontSize="4xl" mb={6}>
          JobSense
        </GradientText>

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
              borderImageSource: 'linear-gradient(to right, #0A66C2, #0077B5)',
              borderRadius: '12px',
              backgroundColor: 'transparent',
              color: 'white',
              padding: '0.5rem 1rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease-in-out',
              _hover: {
                backgroundColor: 'linear-gradient(to right, #0A66C2, #0077B5)',
                color: 'white',
                borderRadius: '12px',
                boxShadow: '0px 0px 15px rgba(10, 102, 194, 0.7)',
              },
            }}
          >
            Sign in with LinkedIn
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default SignIn;
