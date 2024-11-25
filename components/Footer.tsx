import React from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Link as ChakraLink,
  Divider,
  Icon,
} from '@chakra-ui/react';
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <Box bg="#1A1A1A" color="white" py={10} px={{ base: 5, md: 20 }}>
      {/* Top Section */}
      <Flex
        justifyContent="space-between"
        alignItems="center"
        flexDirection={{ base: 'column', md: 'row' }}
        mb={8}
      >
        <VStack
          alignItems="start"
          spacing={3}
          maxW={{ base: '100%', md: '40%' }}
        >
          <Text fontSize="2xl" fontWeight="bold">
            JobSense
          </Text>
          <Text color="gray.400" fontSize="sm">
            Your AI-powered career companion. Get personalized job
            recommendations, market insights, and career upskilling advice to
            achieve your professional goals.
          </Text>
        </VStack>

        <HStack spacing={8} mt={{ base: 6, md: 0 }}>
          <VStack align="start" spacing={2}>
            <Text fontSize="sm" fontWeight="bold">
              Company
            </Text>
            <ChakraLink href="/about" _hover={{ color: '#FF006E' }}>
              About Us
            </ChakraLink>
            <ChakraLink href="/privacy-policy" _hover={{ color: '#FF006E' }}>
              Privacy Policy
            </ChakraLink>
            <ChakraLink href="/terms-of-service" _hover={{ color: '#FF006E' }}>
              Terms of Service
            </ChakraLink>
          </VStack>

          <VStack align="start" spacing={2}>
            <Text fontSize="sm" fontWeight="bold">
              Resources
            </Text>
            <ChakraLink href="/blog" _hover={{ color: '#FF006E' }}>
              Blog
            </ChakraLink>
            <ChakraLink href="/help" _hover={{ color: '#FF006E' }}>
              Help Center
            </ChakraLink>
            <ChakraLink href="/faq" _hover={{ color: '#FF006E' }}>
              FAQ
            </ChakraLink>
          </VStack>
        </HStack>
      </Flex>

      {/* Divider */}
      <Divider borderColor="gray.600" mb={8} />

      {/* Bottom Section */}
      <Flex
        justifyContent="space-between"
        alignItems="center"
        flexDirection={{ base: 'column', md: 'row' }}
      >
        <Text fontSize="sm" color="gray.500">
          © {new Date().getFullYear()} JobSense. All rights reserved.
        </Text>
        <HStack spacing={5} mt={{ base: 4, md: 0 }}>
          <ChakraLink
            href="https://linkedin.com/company/jobsense"
            isExternal
            aria-label="LinkedIn"
          >
            <Icon as={FaLinkedin} w={6} h={6} _hover={{ color: '#0077B5' }} />
          </ChakraLink>
          <ChakraLink
            href="https://twitter.com/jobsense"
            isExternal
            aria-label="Twitter"
          >
            <Icon as={FaTwitter} w={6} h={6} _hover={{ color: '#1DA1F2' }} />
          </ChakraLink>
          <ChakraLink
            href="https://github.com/jobsense"
            isExternal
            aria-label="GitHub"
          >
            <Icon as={FaGithub} w={6} h={6} _hover={{ color: '#FF006E' }} />
          </ChakraLink>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Footer;
