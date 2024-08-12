import React from "react";
import {
  Box,
  Button,
  Text,
  Image,
  VStack,
  HStack,
  Flex,
  chakra,
} from "@chakra-ui/react";
import Link from "next/link";

const GradientText = chakra(Text, {
  baseStyle: {
    bgClip: "text",
    bgGradient: "linear(to-r, #7E00FB, #4B0095)",
    fontWeight: "bold",
  },
});

const IndexPage = () => {
  return (
    <Box
      p={5}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      flexDirection={{ base: "column", md: "row" }}
      minHeight="100vh"
      bg="white"
      position="relative"
      overflow="hidden"
    >
      <Flex
        justifyContent="flex-start"
        alignItems="center"
        position="absolute"
        top="20px"
        left="20px"
        zIndex="2"
      >
        <Image src="/logo.png" alt="Logo" boxSize="50px" mr={2} />
        <GradientText fontSize="2xl">JobSense</GradientText>
      </Flex>

      {/* Left side content */}
      <VStack
        spacing={8}
        align="flex-start"
        flex="1"
        p={5}
        zIndex="1"
        mt="80px"
      >
        {" "}
        {/* Heading and Description */}
        <GradientText as="h1" fontSize="6xl" textAlign="left">
          Empower Your Career with AI-Driven Insights
        </GradientText>
        <Text fontSize="xl" color="gray.600" textAlign="left">
          JobSense provides personalized job recommendations, real-time market
          insights, and certification guidance to help you stay competitive in
          the tech industry.
        </Text>
        {/* Buttons */}
        <HStack spacing={4}>
          <Link href="/dashboard" passHref>
            <Button backgroundColor="#7E00FB" color="white" size="lg">
              Go to Dashboard
            </Button>
          </Link>
          <Link
            href="https://drive.google.com/file/d/1wyJb7LlQA4zeD-Oll264UXnw7tyabbT3/view"
            passHref
          >
            <Button
              colorScheme="purple"
              variant="outline"
              size="lg"
              borderColor="#7E00FB"
              color="#7E00FB"
              _hover={{ backgroundColor: "#7E00FB", color: "white" }}
            >
              Watch Video
            </Button>
          </Link>
        </HStack>
      </VStack>

      {/* Right side image with custom-shaped purple background */}
      <Box
        flex="1"
        display="flex"
        justifyContent="center"
        alignItems="center"
        position="relative"
        zIndex="1"
      >
        <Image
          src="/preview.png"
          alt="AI-Driven Insights"
          borderRadius="lg"
          shadow="lg"
          maxWidth="90%"
        />
      </Box>

      {/* Background shape */}
      <Box
        position="absolute"
        top="0"
        right="0"
        bottom="0"
        width="50%"
        bgGradient="linear(to-l, #7E00FB, #4B0095)"
        borderTopLeftRadius="50%"
        borderBottomLeftRadius="50%"
        zIndex="0"
      />
    </Box>
  );
};

export default IndexPage;
