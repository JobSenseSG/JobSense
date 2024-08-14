import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Text,
  Image,
  VStack,
  HStack,
  Flex,
  chakra,
  SimpleGrid,
  keyframes,
} from "@chakra-ui/react";
import Link from "next/link";

const GradientText = chakra(Text, {
  baseStyle: {
    bgClip: "text",
    bgGradient: "linear(to-r, #6A00F4, #BF00FF, #FF006E)",
    fontWeight: "bold",
    display: "inline",
  },
});

interface CardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}


const slideInBounce = keyframes`
  0% {
    transform: translateX(100%);
  }
  70% {
    transform: translateX(-5%);
  }
  100% {
    transform: translateX(0);
  }
`;

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const gradientBorderStyle = {
  border: "2px solid",
  borderImageSlice: 1,
  borderImageSource: "linear-gradient(to right, #6A00F4, #BF00FF, #FF006E)",
  borderRadius: "12px", // Explicitly set the border-radius
  backgroundColor: "transparent",
  color: "white",
  padding: "0.5rem 1rem",
  fontWeight: "bold",
  transition: "all 0.3s ease-in-out", // Add transition for smooth hover effect
  _hover: {
    backgroundColor: "linear-gradient(to right, #6A00F4, #BF00FF, #FF006E)",
    color: "white",
    borderRadius: "12px", // Ensure border-radius is maintained on hover
    boxShadow: "0px 0px 15px rgba(106, 0, 244, 0.7)", // Add shadow for hover effect
  },
};

const Card: React.FC<CardProps> = ({ title, description, icon }) => (
  <Box
    position="relative"
    bg="#1A1A1A"
    borderRadius="lg"
    p={6}
    boxShadow="lg"
    _hover={{ boxShadow: "xl", transform: "translateY(-5px)" }}
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
      >
        <GradientText fontSize="7xl" mb={4}>
          JobSense
        </GradientText>
        <Text fontSize="6xl" fontWeight="bold" mb={4}>
          <GradientText>Empower Your Career{" "}</GradientText>
          with AI-Driven Insights
        </Text>
        <Text fontSize="xl" color="gray.300" mb={8}>
          JobSense provides personalized job recommendations, real-time market
          insights, and certification guidance to help you stay competitive in
          the tech industry.
        </Text>
        <HStack spacing={4}>
          <Link href="/dashboard" passHref>
            <Button sx={gradientBorderStyle}>Go to Dashboard</Button>
          </Link>
          <Link
            href="https://drive.google.com/file/d/1wyJb7LlQA4zeD-Oll264UXnw7tyabbT3/view"
            passHref
          >
            <Button sx={gradientBorderStyle}>Watch Video</Button>
          </Link>
        </HStack>
      </Box>

      {/* Divider Line */}
      <Box bg="gray.600" height="1px" width="80%" mx="auto" my={20} />

      {/* Cards Section */}
      <Box mt={20} p={10} width="100%" zIndex="2">
        <Text
          textAlign="center"
          fontSize="3xl"
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

      {/* Dashboard Preview Section */}
      <Box mt={20} p={10} width="100%" zIndex="2">
        <Text
          fontSize="3xl"
          fontWeight="bold"
          textAlign="center"
          mb={10}
          color="white"
        >
          See JobSense in Action
        </Text>

        <Flex
          flexDirection={{ base: "column", md: "row" }}
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Text Section */}
          <VStack
            align="flex-start"
            spacing={4}
            flex="1"
            pr={{ md: 16 }} // Increased padding-right to create more space
            textAlign={{ base: "center", md: "left" }}
          >
            <GradientText fontSize="2xl" fontWeight="bold">
              Experience AI-Powered Career Insights in Real-Time
            </GradientText>
            <Text color="gray.300" fontSize="xl">
              <span style={{ color: "#A020F0", fontWeight: "bold" }}>• </span>
              Upload your resume and instantly receive personalized job
              recommendations based on your unique skills and experience.
            </Text>
            <Text color="gray.300" fontSize="xl">
              <span style={{ color: "#A020F0", fontWeight: "bold" }}>• </span>
              Compare your certifications with current market demands and
              identify areas for improvement.
            </Text>
            <Text color="gray.300" fontSize="xl">
              <span style={{ color: "#A020F0", fontWeight: "bold" }}>• </span>
              Track your job qualification scale to discover how well you meet
              the requirements of your target jobs.
            </Text>
          </VStack>

          {/* Image Section */}
          <Box flex="1" mt={{ base: 16, md: 0 }}>
            {" "}
            {/* Increased margin-top on mobile for more space */}
            <Image
              src="/preview.png" // replace with your actual image path
              alt="Dashboard Preview"
              borderRadius="lg"
              shadow="0px 4px 20px rgba(144, 0, 255, 0.6)" // Updated shadow effect
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
