import React, { useMemo } from 'react';
import {
  Box,
  Button,
  HStack,
  Input,
  Stack,
  Text,
  VStack,
  Badge,
} from '@chakra-ui/react';
import { type GVC } from '../../services/gvcService';

interface ListaGVCTableProps {
  gvcs: GVC[];
  onEdit: (gvc: GVC) => void;
  onDelete: (gvc: GVC) => void;
  onToggleStatus: (gvc: GVC) => void;
}

type SortBy = 'posicao' | 'alfabetica';

export const ListaGVCTable = ({
  gvcs,
  onEdit,
  onDelete,
  onToggleStatus,
}: ListaGVCTableProps) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState<SortBy>('posicao');

  // Filtrar por nome/sobrenome
  const gvcsFiltrados = useMemo(() => {
    return gvcs.filter((gvc) =>
      gvc.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [gvcs, searchTerm]);

  // Ordenar por posição ou alfabética
  const gvcsOrdenados = useMemo(() => {
    const copia = [...gvcsFiltrados];

    if (sortBy === 'posicao') {
      return copia.sort((a, b) => a.posicao - b.posicao);
    } else {
      return copia.sort((a, b) => a.nome.localeCompare(b.nome));
    }
  }, [gvcsFiltrados, sortBy]);

  const getStatusColor = (status: string) => {
    return status === 'ativo' ? 'green' : 'gray';
  };

  return (
    <VStack gap={4} align="stretch">
      {/* Controles de Filtro e Ordenação */}
      <Stack direction={{ base: 'column', md: 'row' }} gap={4}>
        <Input
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          flex={1}
        />

        <HStack>
          <Text fontSize="sm" fontWeight="bold">
            Ordenar:
          </Text>
          <select
            style={{
              padding: '0.5rem',
              borderRadius: '0.375rem',
              border: '1px solid #e5e7eb',
              fontSize: '14px',
            }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
          >
            <option value="posicao">Por Posição</option>
            <option value="alfabetica">Alfabética</option>
          </select>
        </HStack>
      </Stack>

      {/* Tabela */}
      {gvcsOrdenados.length > 0 ? (
        <Box overflowX="auto" borderWidth="1px" borderRadius="lg">
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', width: '80px' }}>
                  Posição
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>
                  Nome
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>
                  Status
                </th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {gvcsOrdenados.map((gvc) => (
                <tr
                  key={gvc.id}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: 'white',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                >
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: '700', fontSize: '16px' }}>
                    {gvc.posicao}º
                  </td>
                  <td style={{ padding: '12px', fontWeight: '500' }}>
                    {gvc.nome}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Badge colorPalette={getStatusColor(gvc.status)}>
                      {gvc.status === 'ativo' ? '✓ Ativo' : '✗ Inativo'}
                    </Badge>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <HStack justifyContent="center" gap={2}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => onEdit(gvc)}
                      >
                        Editar
                      </Button>

                      <Button
                        size="sm"
                        colorScheme={
                          gvc.status === 'ativo' ? 'orange' : 'green'
                        }
                        variant="ghost"
                        onClick={() => onToggleStatus(gvc)}
                      >
                        {gvc.status === 'ativo' ? 'Desativar' : 'Ativar'}
                      </Button>

                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => onDelete(gvc)}
                      >
                        Deletar
                      </Button>
                    </HStack>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      ) : (
        <Box textAlign="center" py={8}>
          <Text color="gray.500">
            {searchTerm
              ? 'Nenhum GVC encontrado com esse nome'
              : 'Nenhum GVC cadastrado ainda'}
          </Text>
        </Box>
      )}

      {/* Resumo */}
      <Text fontSize="sm" color="gray.600">
        Total: <strong>{gvcsOrdenados.length}</strong> GVCs
        {searchTerm && ` (filtrados de ${gvcs.length})`}
      </Text>
    </VStack>
  );
};
