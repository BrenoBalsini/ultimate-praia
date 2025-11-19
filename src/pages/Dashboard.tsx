import { Box, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  route: string;
}

const cards: DashboardCard[] = [
    {
    title: '👥 Guarda-Vidas',
    description: 'Gerenciar guarda-vidas do sistema',
    icon: '👥',
    route: '/gvcs',
  },
  {
    title: '📍 Postos e Materiais',
    description: 'Gerenciar materiais nos postos (guarda-sóis, rádios, etc)',
    icon: '📍',
    route: '/postos',
  },
  {
    title: '📝 Alterações de Posto',
    description: 'Registrar problemas estruturais nos postos',
    icon: '📝',
    route: '/alteracoes-posto',
  },
  {
    title: '🚗 Alterações de Veículos',
    description: 'Controlar avarias em veículos',
    icon: '🚗',
    route: '/alteracoes-veiculos',
  },
  {
    title: '⭐ Conduta e Elogios',
    description: 'Registrar alterações e elogios de guarda-vidas',
    icon: '⭐',
    route: '/conduta',
  },
  {
    title: '📋 Solicitações GVC',
    description: 'Gerenciar solicitações dos guarda-vidas',
    icon: '📋',
    route: '/solicitacoes-gvc',
  },
  {
    title: '🎒 Cautelas e Solicitações',
    description: 'Sistema de empréstimo de equipamentos',
    icon: '🎒',
    route: '/cautelas',
  },
];

export const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />

      <Box px={6} py={8} maxW="1200px" mx="auto">
        <VStack align="start" gap={8}>
          <Box>
            <Heading size="lg" mb={2}>
              Bem-vindo ao Sistema de Gestão
            </Heading>
            <Text color="gray.600">
              Selecione uma funcionalidade abaixo para começar
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} w="full">
            {cards.map((card) => (
              <Box
                key={card.route}
                bg="white"
                p={6}
                rounded="lg"
                boxShadow="md"
                cursor="pointer"
                transition="all 0.3s"
                _hover={{
                  boxShadow: 'lg',
                  transform: 'translateY(-4px)',
                }}
                onClick={() => navigate(card.route)}
              >
                <Text fontSize="3xl" mb={2}>
                  {card.icon}
                </Text>
                <Heading size="sm" mb={2}>
                  {card.title}
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  {card.description}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Box>
    </Box>
  );
};
