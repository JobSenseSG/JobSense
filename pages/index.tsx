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
import Footer from '../components/Footer';
import InfoBox from '../components/InfoBox';
import DemoSection from '@/components/DemoSection';
import TopGrid from '@/components/TopThreeDGridBackground';
import BottomGrid from '@/components/BottomThreeDGridBackground';

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
  position: 'relative',
  display: 'inline-block',
  padding: '0.5rem 1rem',
  color: 'white',
  fontWeight: 'bold',
  textAlign: 'center',
  textDecoration: 'none',
  borderRadius: '25px', // Set the border radius here
  backgroundImage: 'linear-gradient(to right, #6A00F4, #BF00FF, #FF006E)', // Gradient background
  backgroundClip: 'padding-box',
  border: '2px solid transparent',
  boxShadow: '0px 0px 15px rgba(106, 0, 244, 0.7)', // Optional for a glowing effect
  transition: 'all 0.3s ease-in-out',
  _hover: {
    color: 'white',
    background: 'linear-gradient(to right, #6A00F4, #BF00FF, #FF006E)',
    borderRadius: '25px', // Maintain the curve on hover
    boxShadow: '0px 0px 20px rgba(106, 0, 244, 0.9)',
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
    <Box
      bg="#121212"
      color="white"
      overflow="hidden"
      position="relative"
      minHeight="100vh"
      pt={{ base: '300px', md: '0px' }}
      backgroundSize="80%" // Ensures the image covers the container without repeating
      backgroundRepeat="no-repeat" // Prevents the image from repeating
      backgroundPosition="center" // Centers the image within the container
    >
      <Box display={{ base: 'none', lg: 'block' }}>
        <TopGrid />
      </Box>
      <Box display={{ base: 'none', lg: 'block' }}>
        <BottomGrid />
      </Box>
      <Navbar />
      {/* Top Section */}
      <Box
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 40,
          right: 40,
          bottom: 0,
          backgroundImage: `radial-gradient(circle, #2a2a2a 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          maskImage: `linear-gradient(to bottom, black, transparent)`, // Creates the fading effect
          WebkitMaskImage: `linear-gradient(to bottom, black, transparent)`, // For WebKit browsers
          zIndex: -1,
          pointerEvents: 'none',
        }}
        zIndex={1}
      >
        <Box
          p={{ base: 4, md: 8 }}
          display="flex"
          flexDirection={{ base: 'column', md: 'row' }}
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          textAlign={{ base: 'center', md: 'left' }}
          gap={{ base: 6, md: 0 }} // Add consistent gap
        >
          {/* Left Section */}
          <Box
            flex="1"
            pl={{ base: 4, md: 8, lg: 16 }}
            pr={{ base: 4, md: 8, lg: 16 }}
            maxWidth={{ base: '100%', md: '90%', lg: '600px', xl: '700px' }}
            textAlign={{ base: 'center', lg: 'left' }}
          >
            <Text
              fontSize={{ base: '2xl', md: '3xl', lg: '4xl', xl: '5xl' }}
              fontWeight="bold"
              lineHeight={{ base: '1.3', md: '1.5', lg: '1.6' }}
              mb={4} // Reduced margin
            >
              <GradientText>Empower Your Career </GradientText>
              with AI-Driven Insights
            </Text>
            <Text
              fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
              lineHeight={{ base: '1.5', md: '1.7', lg: '2' }}
              color="gray.300"
              mb={4} // Reduced margin
            >
              JobSense provides personalized job recommendations, real-time
              market insights, and certification guidance to help you stay
              competitive in the tech industry.
            </Text>
            <HStack
              spacing={4}
              justifyContent={{ base: 'center', lg: 'flex-start' }}
            >
              <Link href="/dashboard" passHref>
                <Button
                  sx={gradientBorderStyle}
                  size={{ base: 'sm', md: 'md' }}
                >
                  Try it now
                </Button>
              </Link>
            </HStack>
          </Box>
          {/* Right Section */}
          <Box
            display={{ base: 'none', lg: 'grid' }}
            gridTemplateColumns={{
              base: '1fr',
              md: '1fr 1fr',
              lg: '1fr 1fr',
            }}
            gap={6}
            justifyContent="center"
            alignItems="center"
            px={{ base: 4, md: 4 }}
          >
            <InfoBox icon="📊" text="Personalized Job Recommendations" />
            <InfoBox icon="📈" text="Real-Time Market Insights" />
            <InfoBox icon="🎓" text="Certification Guidance" />
            <InfoBox icon="🤖" text="AI-Trained Recommendations" />
            <InfoBox icon="✅" text="Match Score for Job Listings" />
            <InfoBox icon="📚" text="Comprehensive Data Collection" />
          </Box>
        </Box>
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
          Explore JobSense Features
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

      <DemoSection />
      {/* Footer Section */}
      <Footer />
    </Box>
  );
};

export default IndexPage;
