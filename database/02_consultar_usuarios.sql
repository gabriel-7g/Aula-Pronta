-- Script de consulta para mostrar ao professor as contas cadastradas.
-- NÃO mostra hashes/senhas; apenas colunas informativas.
SELECT id, nome, email, tipo, criado_em
FROM usuarios
ORDER BY nome;
