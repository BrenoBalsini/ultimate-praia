import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
    >
      <VStack gap={6} textAlign="center">
        <Heading size="2xl">404</Heading>
        <Text fontSize="lg" color="gray.600">
          Página não encontrada
        </Text>
        <Button
          colorScheme="blue"
          onClick={() => navigate('/dashboard')}
        >
          Voltar ao Dashboard
        </Button>
      </VStack>
    </Box>
  );
};
