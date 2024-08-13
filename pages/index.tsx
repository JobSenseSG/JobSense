import React from 'react';
import { Button, Box, Heading, Text } from '@chakra-ui/react';

const HomePage: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bg="gray.50"
      p={4}
    >
      <Heading as="h1" size="2xl" mb={4}>
        Welcome to My Next.js App!
      </Heading>
      <Text fontSize="lg" mb={6}>
        This is a basic example of a Next.js index page using Chakra UI for styling.
      </Text>
      <Button colorScheme="teal" size="lg">
        Get Started
      </Button>
    </Box>
  );
};

export default HomePage;
