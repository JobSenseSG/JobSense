import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Text,
  Flex,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Progress,
} from '@chakra-ui/react';

const demoContent = [
  {
    title: 'Upload Your Resume for AI-Generated Insights',
    description:
      'Discover how AI analyzes your resume to match you with the best job qualifications and skills development recommendations.',
    media: {
      src: '/videos/resume_upload.mp4',
    },
  },
  {
    title: 'Compare Certifications for Career Growth',
    description:
      'Use AI to evaluate certifications and compare them against market demands for optimal career progression.',
    media: {
      src: '/videos/compare_certifications.mp4',
    },
  },
  {
    title: 'Empowering Enterprises with AI-Driven Workforce Solutions',
    description:
      'Explore how our AI-powered platform helps businesses analyze team skills, identify gaps, and create tailored upskilling roadmaps to drive organizational growth and employee success.',
    media: {
      src: '/videos/b2b_form.mp4',
    },
  },
];

const DemoSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0); // Dynamically track video duration
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset progress and set duration when active tab changes
  useEffect(() => {
    setProgress(0); // Reset progress
    const videoElement = videoRef.current;

    if (videoElement) {
      const handleLoadedMetadata = () => {
        setDuration(videoElement.duration); // Set the actual video duration
        videoElement.play(); // Auto-play the video
      };

      // Ensure metadata is loaded to fetch duration
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        videoElement.removeEventListener(
          'loadedmetadata',
          handleLoadedMetadata
        );
      };
    }
  }, [activeIndex]);

  // Smoothly update progress bar
  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      const updateProgress = () => {
        if (videoElement.duration) {
          setProgress((videoElement.currentTime / videoElement.duration) * 100);
        }
        requestAnimationFrame(updateProgress); // Smooth progress update
      };

      requestAnimationFrame(updateProgress); // Start tracking progress
    }
  }, [duration]);

  // Automatically switch tabs when video ends
  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      const handleVideoEnd = () => {
        const nextIndex = (activeIndex + 1) % demoContent.length; // Loop back to first tab
        setActiveIndex(nextIndex);
      };

      videoElement.addEventListener('ended', handleVideoEnd);

      return () => {
        videoElement.removeEventListener('ended', handleVideoEnd);
      };
    }
  }, [activeIndex]);

  return (
    <Box mt={20} p={10} width="100%" zIndex="2">
      <Text
        fontSize={{ base: '2xl', md: '3xl' }}
        fontWeight="bold"
        textAlign="center"
        mb={10}
        color="white"
      >
        See JobSense In Action
      </Text>

      {/* Enclosing Box with Border */}
      <Box
        border="1px solid #444"
        borderRadius="md"
        p={5}
        bg="#121212"
        shadow="md"
      >
        <Text
          fontSize="xl"
          fontWeight="bold"
          color="white"
          mb={4}
          textAlign="left"
        >
          Demos
        </Text>
        <Flex flexDirection={{ base: 'column', md: 'row' }} gap={6}>
          {/* Accordion for Tabs */}
          <Box
            flex="1"
            bg="#1A1A1A"
            p={4}
            borderRadius="md"
            shadow="md"
            position="relative"
            zIndex="10"
          >
            {' '}
            <Accordion allowToggle index={activeIndex}>
              {demoContent.map((demo, index) => (
                <AccordionItem
                  key={index}
                  border="none"
                  onClick={() => setActiveIndex(index)}
                >
                  <AccordionButton
                    _hover={{ bg: 'gray.700' }}
                    _focus={{ boxShadow: 'none' }}
                  >
                    <Box
                      flex="1"
                      textAlign="left"
                      fontWeight="bold"
                      color={activeIndex === index ? 'white' : 'gray.400'}
                    >
                      {demo.title}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4} color="gray.300">
                    {demo.description}
                  </AccordionPanel>
                  {/* Progress Bar */}
                  {activeIndex === index && (
                    <Progress
                      value={progress}
                      size="xs"
                      colorScheme="purple"
                      mt={2}
                      transition="width 0.1s ease" // Smooth transition
                    />
                  )}
                </AccordionItem>
              ))}
            </Accordion>
          </Box>

          {/* Demo Preview */}
          <Box
            flex="2"
            display="flex"
            justifyContent="center"
            alignItems="center"
            bg="black"
            borderRadius="md"
            shadow="md"
            height="100%"
            style={{
              transition: 'opacity 0.3s ease-in-out', // Smooth transition for switching videos
            }}
          >
            <video
              ref={videoRef}
              src={demoContent[activeIndex].media.src}
              muted
              autoPlay
              loop={false}
              playsInline
              style={{
                borderRadius: '8px',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default DemoSection;
