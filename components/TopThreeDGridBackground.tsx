import { Box } from '@chakra-ui/react';

const TopThreeDGridBackground = () => (
  <Box
    position="absolute"
    top="0"
    left="0"
    width="100%"
    height="100%"
    zIndex="0"
  >
    {/* Vertical Lines */}
    <Box
      position="absolute"
      top="0"
      left="15%"
      right="15%"
      height="150px"
      display="flex"
      justifyContent="space-between"
    >
      {[...Array(9)].map((_, index) => (
        <Box
          key={index}
          height="100%"
          width="1px"
          bg="linear-gradient(to bottom, rgba(255, 255, 255, 0.0), rgba(255, 255, 255, 0.3))" // Gradient fade effect
        />
      ))}
    </Box>

    {/* Bottom Angled Lines */}
    <Box
      position="absolute"
      top="150px"
      left="15%"
      right="15%"
      height="150px"
      display="flex"
      justifyContent="space-between"
    >
      {[...Array(9)].map((_, index) => {
        const angle =
          index === 4
            ? 'none' // Middle line is straight
            : index < 4
              ? `rotate(-${60 - index * 5}deg)` // Steeper angles on the left
              : `rotate(${60 - (8 - index) * 5}deg)`; // Steeper angles on the right

        return (
          <Box
            key={index}
            height="100px"
            width="1px"
            bg="linear-gradient(to top, rgba(255, 255, 255, 0.0), rgba(255, 255, 255, 0.3))" // Gradient fade for angled lines
            transform={angle}
            transformOrigin="top"
          />
        );
      })}
    </Box>

    {/* Horizontal Lines */}
    <Box
      position="absolute"
      top="110px" // Adjust to align with the bottom of angled lines
      left="15%"
      right="15%"
      height="1px"
      display="flex"
      justifyContent="space-between"
      bg=" rgba(255, 255, 255, 0.3)" // Gradient to match angled lines
    >
      {[...Array(8)].map((_, index) => (
        <Box
          key={index}
          width="calc(12% - 1px)" // Matches the distance between angled lines
          height="1px"
        />
      ))}
    </Box>
    <Box
      position="absolute"
      top="170px" // Adjust to align with the bottom of angled lines
      left="17.5%"
      right="17.5%"
      height="1px"
      display="flex"
      justifyContent="space-between"
      bg=" rgba(255, 255, 255, 0.2)" // Gradient to match angled lines
    >
      {[...Array(8)].map((_, index) => (
        <Box
          key={index}
          width="calc(12% - 1px)" // Matches the distance between angled lines
          height="1px"
        />
      ))}
    </Box>
    <Box
      position="absolute"
      top="200px" // Adjust to align with the bottom of angled lines
      left="20.5%"
      right="20.5%"
      height="1px"
      display="flex"
      justifyContent="space-between"
      bg=" rgba(255, 255, 255, 0.05)" // Gradient to match angled lines
    >
      {[...Array(8)].map((_, index) => (
        <Box
          key={index}
          width="calc(12% - 1px)" // Matches the distance between angled lines
          height="1px"
        />
      ))}
    </Box>
  </Box>
);

export default TopThreeDGridBackground;
