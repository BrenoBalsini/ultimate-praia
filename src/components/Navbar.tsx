import { Box, Button, Flex, Heading, HStack } from '@chakra-ui/react';
import { logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toaster } from './ui/toasterExport';

export const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toaster.create({
        title: 'Desconectado com sucesso',
        type: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toaster.create({
        title: 'Erro ao desconectar',
        type: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Box bg="blue.600" px={6} py={4} boxShadow="md">
      <Flex justify="space-between" align="center">
        <Heading size="md" color="white">
          🏖️ Gestão de Praia
        </Heading>

        <HStack gap={4}>
          <Box color="white" fontSize="sm">
            {user?.displayName || user?.email}
          </Box>
          <Button
            size="sm"
            colorScheme="red"
            variant="solid"
            onClick={handleLogout}
          >
            Sair
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};
