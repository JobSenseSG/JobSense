import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Flex,
  Icon,
  Divider,
  Button,
  CloseButton,
} from '@chakra-ui/react';
import { FaFileAlt, FaMapSigns, FaBars } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useBreakpointValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { chakra } from '@chakra-ui/react';

const MotionBox = chakra(motion.div);

const GradientText = chakra(Text, {
  baseStyle: {
    bgClip: 'text',
    bgGradient: 'linear(to-r, #6A00F4, #BF00FF, #FF006E)', 
    fontWeight: 'bold',
  },
});

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const isDesktop = useBreakpointValue({ base: false, md: true });

  return (
    <>
      {/* Hamburger Menu Button for Mobile */}
      {!isDesktop && (
        <Button
          display={{ base: 'block', md: 'none' }}
          onClick={() => setIsOpen(true)}
          position="absolute"
          top="10px"
          left="10px"
          zIndex={1}
          bg="#5A4FCF"
          color="white"
        >
          <Icon as={FaBars} />
        </Button>
      )}

      {/* Overlay to close the sidebar by clicking outside of it */}
      {!isDesktop && isOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          bg="rgba(0, 0, 0, 0.5)"
          zIndex={999}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar with slide-in animation */}
      <MotionBox
        as="nav"
        width="250px"
        height="100vh"
        bg="#1A1A1A"
        color="white"
        paddingY="4"
        boxShadow="lg"
        position="fixed"
        top="0"
        zIndex={1000}
        left={isDesktop ? '0' : isOpen ? '0' : '-250px'}
        transition="0.3s ease"
      >
        {/* Close Button */}
        {!isDesktop && (
          <CloseButton
            display={{ base: 'block', md: 'none' }}
            color="white"
            position="absolute"
            top="10px"
            right="10px"
            onClick={() => setIsOpen(false)}
          />
        )}

        <Flex justifyContent="center" marginBottom="8">
          {/* Gradient text for JobSense B2B */}
          <GradientText fontSize="2xl" textAlign="center">
            JobSense B2B
          </GradientText>
        </Flex>

        <VStack align="start" spacing="4">
          <Flex
            align="center"
            padding="4"
            width="100%"
            _hover={{ bg: '#7E00FB', cursor: 'pointer' }}
            onClick={() => {
              router.push('/teamAnalysisReport');
              setIsOpen(false);
            }}
          >
            <Icon as={FaFileAlt} marginRight="4" />
            <Text>Team Analysis</Text>
          </Flex>

          <Divider borderColor="whiteAlpha.600" width="80%" mx="auto" />

          <Flex
            align="center"
            padding="4"
            width="100%"
            _hover={{ bg: '#7E00FB', cursor: 'pointer' }}
            onClick={() => {
              router.push('/b2b-roadmap');
              setIsOpen(false);
            }}
          >
            <Icon as={FaMapSigns} marginRight="4" />
            <Text>Roadmap</Text>
          </Flex>
        </VStack>
      </MotionBox>
    </>
  );
};

export default Sidebar;
