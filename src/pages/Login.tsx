import { Box, Button, Heading, Text, VStack, Image } from '@chakra-ui/react';
import { signInWithGoogle } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { toaster } from '../components/ui/toasterExport';

export const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      toaster.create({
        title: 'Login realizado com sucesso!',
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toaster.create({
        title: 'Erro ao fazer login',
        description: 'Tente novamente mais tarde',
        type: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      px={4}
    >
      <Box
        maxW="md"
        w="full"
        bg="white"
        boxShadow="lg"
        rounded="lg"
        p={8}
      >
        <VStack gap={6}>
          <Box textAlign="center">
            <Heading size="xl" mb={2}>
              Gerenciamento de Praia
            </Heading>
            <Text color="gray.600">
              Sistema para Bombeiros Militares
            </Text>
          </Box>

          <Button
            w="full"
            size="lg"
            onClick={handleGoogleLogin}
            colorScheme="blue"
          >
            <Image
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              boxSize="20px"
              mr={2}
            />
            Entrar com Google
          </Button>

          <Text fontSize="sm" color="gray.500" textAlign="center">
            Faça login com sua conta do Google para acessar o sistema
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};
