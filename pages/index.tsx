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
    bgGradient: "linear(to-r, #8E2DE2, #4A00E0)",
    fontWeight: "bold",
  },
});

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

const Card = ({ title, description, icon }) => (
  <Box
    bg="#1A1A1A"
    borderRadius="lg"
    p={6}
    boxShadow="lg"
    _hover={{ boxShadow: "xl", transform: "translateY(-5px)" }}
    transition="all 0.3s ease"
  >
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
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation when the component mounts
    setAnimate(true);
  }, []);

  return (
    <Box bg="#121212" color="white" overflow="hidden">
      {/* Top Section */}
      <Box
        p={5}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexDirection={{ base: "column", md: "row" }}
        minHeight="100vh"
        position="relative"
      >
        <Flex
          justifyContent="flex-start"
          alignItems="center"
          position="absolute"
          top="20px"
          left="20px"
          zIndex="10"
        >
          <GradientText mr={2} fontSize="2xl">
            JobSense
          </GradientText>
        </Flex>

        <VStack
          spacing={8}
          align="flex-start"
          flex="1"
          p={5}
          zIndex="1"
          mt="80px"
        >
          <GradientText as="h1" fontSize="6xl" textAlign="left">
            Empower Your Career with AI-Driven Insights
          </GradientText>
          <Text fontSize="xl" color="gray.300" textAlign="left">
            JobSense provides personalized job recommendations, real-time market
            insights, and certification guidance to help you stay competitive in
            the tech industry.
          </Text>
          <HStack spacing={4}>
            <Link href="/dashboard" passHref>
              <Button
                backgroundColor="transparent"
                color="white"
                size="lg"
                border="2px solid"
                borderColor="white"
                _hover={{ backgroundColor: "#8E2DE2", color: "white" }}
              >
                Go to Dashboard
              </Button>
            </Link>
            <Link
              href="https://drive.google.com/file/d/1wyJb7LlQA4zeD-Oll264UXnw7tyabbT3/view"
              passHref
            >
              <Button
                backgroundColor="transparent"
                color="white"
                size="lg"
                border="2px solid"
                borderColor="white"
                _hover={{ backgroundColor: "#8E2DE2", color: "white" }}
              >
                Watch Video
              </Button>
            </Link>
          </HStack>
        </VStack>

        <Box
          flex="1"
          display="flex"
          justifyContent="center"
          alignItems="center"
          position="relative"
          zIndex="1"
          animation={animate ? `${fadeIn} 1s ease-in-out forwards` : "none"}
        >
          <Image
            src="/preview.png"
            alt="AI-Driven Insights"
            borderRadius="lg"
            shadow="lg"
            maxWidth="90%"
          />
        </Box>

        <Box
          position="absolute"
          top="0"
          right="0"
          bottom="0"
          width="50%"
          bgGradient="linear(to-l, #8E2DE2, #4A00E0)"
          borderTopLeftRadius="50%"
          borderBottomLeftRadius="50%"
          zIndex="0"
          animation={
            animate ? `${slideInBounce} 0.9s ease-out forwards` : "none"
          }
        />
      </Box>

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
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default IndexPage;
