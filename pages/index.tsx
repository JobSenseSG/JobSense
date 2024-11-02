import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Text,
  HStack,
  VStack,
  Flex,
  chakra,
  Link as ChakraLink,
  SimpleGrid,
  Image,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { User, createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const GradientText = chakra(Text, {
  baseStyle: {
    bgClip: 'text',
    bgGradient: 'linear(to-r, #6A00F4, #BF00FF, #FF006E)',
    fontWeight: 'bold',
    display: 'inline',
  },
});

const gradientBorderStyle = {
  border: '2px solid',
  borderImageSlice: 1,
  borderImageSource: 'linear-gradient(to right, #6A00F4, #BF00FF, #FF006E)',
  borderRadius: '12px',
  backgroundColor: 'transparent',
  color: 'white',
  padding: '0.5rem 1rem',
  fontWeight: 'bold',
  transition: 'all 0.3s ease-in-out',
  _hover: {
    backgroundColor: 'linear-gradient(to right, #6A00F4, #BF00FF, #FF006E)',
    color: 'white',
    borderRadius: '12px',
    boxShadow: '0px 0px 15px rgba(106, 0, 244, 0.7)',
  },
};

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // This hook dynamically changes the menu display based on screen size
  const showHamburger = useBreakpointValue({ base: true, lg: false });

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null); // Reset user state after signing out
  };

  return (
    <Flex
      as="nav"
      bg="#1A1A1A"
      color="white"
      padding="1rem 2rem"
      justifyContent="space-between"
      alignItems="center"
      position="fixed"
      top="0"
      left="0"
      width="100%"
      zIndex="10"
    >
      <Flex alignItems="center">
        <GradientText fontSize="4xl" mr={8}>
          JobSense
        </GradientText>

        {!showHamburger && (
          <HStack spacing={8}>
            <Link href="/dashboard" passHref>
              <ChakraLink _hover={{ color: '#FF006E' }}>Dashboard</ChakraLink>
            </Link>
            <Link href="/enterpriseSolution" passHref>
              <ChakraLink _hover={{ color: '#FF006E' }}>
                Enterprise Solution
              </ChakraLink>
            </Link>
            <Link href="#about" passHref>
              <ChakraLink _hover={{ color: '#FF006E' }}>About</ChakraLink>
            </Link>
          </HStack>
        )}
      </Flex>

      {showHamburger ? (
        <IconButton
          display="block"
          aria-label="Open Menu"
          variant="unstyled" // Removes default styling (background/border)
          onClick={onOpen}
          icon={
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              height="20px"
            >
              <Box width="25px" height="2px" bg="white" />
              <Box width="25px" height="2px" bg="white" />
              <Box width="25px" height="2px" bg="white" />
            </Box>
          }
        />
      ) : (
        <HStack spacing={8}>
          {user ? (
            <>
              <HStack spacing={1}>
                <Text>Welcome,</Text>
                <Text>{user.email}</Text>
              </HStack>
              <Button sx={gradientBorderStyle} onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/auth/signin" passHref>
              <Button sx={gradientBorderStyle}>Login</Button>
            </Link>
          )}
        </HStack>
      )}

      {/* Drawer for small screens */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="#1A1A1A" color="white">
          <DrawerCloseButton />
          <DrawerHeader
            borderBottomWidth="1px"
            borderColor="gray.600"
            fontSize="2xl"
            fontWeight="bold"
            color="#FF006E"
          >
            Menu
          </DrawerHeader>
          <DrawerBody>
            <VStack align="start" spacing={6} mt={8}>
              <Link href="/dashboard" passHref>
                <ChakraLink
                  fontSize="lg"
                  _hover={{ color: '#FF006E' }}
                  onClick={onClose}
                >
                  Dashboard
                </ChakraLink>
              </Link>
              <Link href="/enterpriseSolution" passHref>
                <ChakraLink
                  fontSize="lg"
                  _hover={{ color: '#FF006E' }}
                  onClick={onClose}
                >
                  Enterprise Solution
                </ChakraLink>
              </Link>
              <Link href="#about" passHref>
                <ChakraLink
                  fontSize="lg"
                  _hover={{ color: '#FF006E' }}
                  onClick={onClose}
                >
                  About
                </ChakraLink>
              </Link>

              {user ? (
                <>
                  <Text fontSize="lg" color="gray.400">
                    Welcome, {user.email}
                  </Text>
                  <Button
                    sx={gradientBorderStyle}
                    width="100%"
                    onClick={() => {
                      handleSignOut();
                      onClose();
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link href="/auth/signin" passHref>
                  <Button
                    sx={gradientBorderStyle}
                    width="100%"
                    onClick={onClose}
                  >
                    Login
                  </Button>
                </Link>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};

interface CardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, description, icon }) => (
  <Box
    position="relative"
    bg="#1A1A1A"
    borderRadius="lg"
    p={6}
    boxShadow="lg"
    _hover={{ boxShadow: 'xl', transform: 'translateY(-5px)' }}
    transition="all 0.3s ease"
    overflow="hidden"
  >
    <Box
      position="absolute"
      top="0"
      left="0"
      right="0"
      height="4px"
      bgGradient="linear(to-r, #8E2DE2, #4A00E0)"
      borderTopRadius="lg"
    />
    <HStack spacing={4} mb={4}>
      <Box
        as="span"
        display="inline-block"
        bgGradient="linear(to-r, #8E2DE2, #4A00E0)"
        borderRadius="full"
        p={2}
      >
        {icon}
      </Box>
      <GradientText fontSize="2xl">{title}</GradientText>
    </HStack>
    <Text color="gray.300">{description}</Text>
  </Box>
);

const IndexPage = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Render nothing on the server to prevent mismatch
  }

  return (
    <Box bg="#121212" color="white" overflow="hidden">
      <Navbar />
      {/* Top Section */}
      <Box
        p={5}
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        minHeight="100vh"
        position="relative"
        textAlign="center"
        bgGradient="radial(circle, rgba(144, 0, 255, 0.6), transparent 25%)"
        mt="80px" // Adjusted margin-top to accommodate the fixed navbar
      >
        <Text fontSize={{ base: '4xl', md: '6xl' }} fontWeight="bold" mb={4}>
          <GradientText>Empower Your Career </GradientText>
          with AI-Driven Insights
        </Text>
        <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.300" mb={8}>
          JobSense provides personalized job recommendations, real-time market
          insights, and certification guidance to help you stay competitive in
          the tech industry.
        </Text>
        <HStack spacing={4}>
          <Link href="/dashboard" passHref>
            <Button sx={gradientBorderStyle}>Try it now</Button>
          </Link>
          <Link
            href="https://drive.google.com/file/d/1m8RpzSpwp1y6N-RWU8Nt4-Z4zgzyVlab/view?usp=sharing"
            passHref
          >
            <Button sx={gradientBorderStyle}>Watch Video</Button>
          </Link>
        </HStack>
      </Box>

      {/* Divider Line */}
      <Box bg="gray.600" height="1px" width="80%" mx="auto" my={20} />

      {/* Cards Section */}
      <Box id="about" mt={20} p={10} width="100%" zIndex="2">
        <Text
          textAlign="center"
          fontSize={{ base: '2xl', md: '3xl' }}
          fontWeight="bold"
          mb={10}
          color="white"
        >
          Explore JobSense Fanum Features
        </Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          <Card
            title="Personalized Job Recommendations"
            description="Receive job suggestions tailored to your skills and career goals. Our AI-driven platform analyzes your resume and provides the most relevant job matches, helping you find the perfect role faster and more efficiently."
            icon="📊"
          />
          <Card
            title="Real-Time Market Insights"
            description="Stay ahead of the curve with real-time data on job trends and market demands. Our platform continuously updates to reflect the latest industry trends, ensuring that you're always prepared and positioned for success."
            icon="📈"
          />
          <Card
            title="Certification Guidance"
            description="Identify certifications that will boost your career. Based on your current skill set and industry trends, JobSense recommends certifications that can enhance your expertise and open up new career opportunities."
            icon="🎓"
          />
          <Card
            title="AI-Trained Recommendations"
            description="Our AI is constantly updated with the latest job listings, providing you with accurate and relevant job suggestions that align with your career goals."
            icon="🤖"
          />
          <Card
            title="Match Score for Job Listings"
            description="Get a personalized match score for each job listing, helping you identify the opportunities that best fit your profile and increase your chances of success."
            icon="✅"
          />
          <Card
            title="Comprehensive Data Collection"
            description="We gather data from multiple sources to ensure that our AI provides you with the most current and relevant job market information."
            icon="📚"
          />
        </SimpleGrid>
      </Box>

      {/* Divider Line */}
      <Box bg="gray.600" height="1px" width="80%" mx="auto" my={20} />

      {/* Dashboard Preview Section */}
      <Box mt={20} p={10} width="100%" zIndex="2">
        <Text
          fontSize={{ base: '2xl', md: '3xl' }}
          fontWeight="bold"
          textAlign="center"
          mb={10}
          color="white"
        >
          See JobSense in Action
        </Text>

        <Flex
          flexDirection={{ base: 'column', md: 'row' }}
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Text Section */}
          <VStack
            align="flex-start"
            spacing={4}
            flex="1"
            pr={{ md: 16 }}
            textAlign={{ base: 'center', md: 'left' }}
          >
            <GradientText fontSize="2xl" fontWeight="bold">
              Experience AI-Powered Career Insights in Real-Time
            </GradientText>
            <Text color="gray.300" fontSize="xl">
              <span style={{ color: '#A020F0', fontWeight: 'bold' }}>• </span>
              Upload your resume and instantly receive personalized job
              recommendations based on your unique skills and experience.
            </Text>
            <Text color="gray.300" fontSize="xl">
              <span style={{ color: '#A020F0', fontWeight: 'bold' }}>• </span>
              Compare your certifications with current market demands and
              identify areas for improvement.
            </Text>
            <Text color="gray.300" fontSize="xl">
              <span style={{ color: '#A020F0', fontWeight: 'bold' }}>• </span>
              Track your job qualification scale to discover how well you meet
              the requirements of your target jobs.
            </Text>
          </VStack>

          {/* Image Section */}
          <Box flex="1" mt={{ base: 16, md: 0 }}>
            <Image
              src="/preview.png" // replace with your actual image path
              alt="Dashboard Preview"
              borderRadius="lg"
              shadow="0px 4px 20px rgba(144, 0, 255, 0.6)"
              maxWidth="100%"
              mx="auto"
            />
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default IndexPage;
