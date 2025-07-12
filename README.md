<!-- Inserir titulo do projeto aqui -->
# Simple Web Token (SWT)

<!-- Inserir foto de capa do projeto aqui -->
![Foto de Capa](assets/imgs/foto-de-capa.png)

<!-- Inserir tags relevantes aqui -->
[![licence mit](https://img.shields.io/badge/licence-MIT-blue.svg)](./LICENSE)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

## Sumário
- [Simple Web Token (SWT)](#simple-web-token-swt)
  - [Sumário](#sumário)
  - [Introdução](#introdução)
  - [Tecnologias Usadas](#tecnologias-usadas)
  - [Estrutura do Projeto](#estrutura-do-projeto)
  - [Como Executar o Projeto](#como-executar-o-projeto)
  - [Como Contribuir](#como-contribuir)
  - [Licença](#licença)
  - [Estrutura SWT](#estrutura-swt)
  - [Formação do campo "signature" SWT](#formação-do-campo-signature-swt)
  - [Solicitação de SWT](#solicitação-de-swt)
  - [Validação do SWT](#validação-do-swt)
  - [Revogação de SWT](#revogação-de-swt)

## Introdução
O Simple Web Token (SWT) é uma implementação de token simples e segura baseada em HMAC SHA256 com dupla aplicação de salt. É útil em cenários onde você precisa de um controle próprio de geração, validação e revogação de tokens, sem depender de JWT ou bibliotecas externas pesadas.

## Tecnologias Usadas
![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)&nbsp;
![NodeJS](https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)&nbsp;
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)&nbsp;

## Estrutura do Projeto
Para entender a estrutura do projeto, consulte [Estrutura do Projeto](link_para_o_documentacao_estrutura.md).

## Como Executar o Projeto
Para obter instruções sobre como executar o projeto, consulte [Como Executar o Projeto](link_para_o_documentacao_execucao.md).

## Como Contribuir
Se você quiser contribuir para o projeto, por favor, siga as orientações em [Como Contribuir](link_para_o_documentacao_contribuicao.md).

## Licença
Este projeto está sob a [Licença MIT](./LICENSE.md). Consulte o arquivo [LICENSE.md](LICENSE.md) para obter mais detalhes.

---

## Estrutura SWT

- Formato: JSON

```json
{
    "content": {
        "sti": "jaizei7ohd1lAhxongiu7shiechooka2",
        "issuer":"issuer.example.com",
        "audience":"example.com",
        "expiresOn": 1715829600,
        "id": 1
    },
    "signature": "UfVjjm8AfKoEqXOg8oXnG0klOjP7XhZUSdS4xJHe8eM="
}
```

## Formação do campo "signature" SWT

Assinatura HMAC dupla com salts distintos aplicados sobre o payload serializado.

1. O valor do campo "signature" será gerado por duas funções HMACSHA256 aplicadas em sequência.
2. Cada função HMAC receberá um salt (tempero) exclusivo com até 255 caracteres.
3. Um salt diferente será usado em cada função HMAC para aumentar a segurança.
4. O campo content será codificado para uma string base64.
5. Para cada HMAC, o valor de entrada será formado pela concatenação do conteúdo do campo content codificado em base64 com o respectivo salt.

## Solicitação de SWT

1. **Autenticação do Usuário**
    - Solicitar email e senha do usuário.
    - Validar as credenciais fornecidas.
2. **Geração do SWT**
    - Gerar um SWT com os campos: sti, id, audience, expiresOn, issuer e signature.

## Validação do SWT

1. Verificar se a assinatura (signature) foi revogada.
2. Validar a integridade do SWT comparando a assinatura gerada com a recebida.
3. Validar o ID do usuário.
4. Validar o emitente (issuer).
5. Validar o destinatário (audience).
6. Validar tempo de expiração (expiresOn).

## Revogação de SWT

1. Registrar a assinatura do token em uma lista de revogação.
2. Armazenar metadados como data de revogação e motivo (opcional).