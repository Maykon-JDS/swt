# SWT

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

Descrição: Assinatura HMAC dupla com salts distintos aplicados sobre o payload serializado

1) O valor do campo "signature" será gerado por duas funções HMACSHA256 aplicadas em sequência. O resultado da primeira HMAC será usado como entrada para a segunda.
2) Cada função HMAC receberá um salt (tempero) exclusivo com até 255 caracteres.
3) Um salt diferente será usado em cada função HMAC para aumentar a segurança.
4) O campo content será codificado para uma string base64
5) Para cada HMAC, o valor de entrada será formado pela concatenação do conteúdo do campo content codificado em base64 com o respectivo salt, resultando em uma única string que será usada como parâmetro da função HMACSHA256.

## Solicitação de SWT
1) Autenticação do Usuário
    1) Solicitar email e senha do usuário.
    2) Validar as credenciais fornecidas:
       1) Verificar se o usuário existe.
       2) Validar a senha (de preferência usando hash seguro, como bcrypt ou Argon2).
2) Geração do SWT
    1) Após a autenticação bem-sucedida, o servidor deverá gerar um SWT com os seguintes campos:
        - sti: Identificador único do SWT.
        - id: Identificador único do usuário autenticado.
        - audience: Identificação do sistema ou serviço que deverá aceitar esse token.
        - expiresOn: Timestamp de expiração do token (em segundos desde a época Unix).
        - issuer: Identificador da aplicação emissora do token.
        - signature: Campo de assinatura gerado a partir dos dados acima, conforme a política de assinatura definida.

## Validação do SWT

1) Validar se o SWT já foi revogado
    1) Verificar se a assinatura (signature) existe na tabela de tokens revogados
2) Validar integridada do SWT a partir da assinatura (signature)
    1) Gerar novamente a assinatura com base no conteúdo do campo content.
    2) Comparar a assinatura gerada com a assinatura recebida (signature).
    3) Se houver divergência, rejeitar o token imediatamente.
3) Verificar ID do usuário (id)
    1) Verificar se o id representa um usuário válido no sistema.
    2) Opcional: consultar permissões ou status ativo/inativo.
4) Validar emitente (issuer)
    1) Verificar se o valor corresponde a uma fonte confiável previamente registrada.
    2) Evita aceitar tokens forjados por terceiros não autorizados.
5) Validar destinatário (audience)
    1) Conferir se o token foi destinado à aplicação ou serviço atual.
    2) Previne o uso de tokens emitidos para outros sistemas.
6) Validar tempo de expiração (expiresOn)
    1) Comparar o valor com o timestamp atual.
    2) Rejeitar o token se estiver expirado.

## Revogação de SWT

1) Registrar a assinatura (signature) do token em uma lista de revogação
   1) Armazenar a assinatura (ou um hash dela) em uma tabela dedicada, como revoked_tokens.
   2) A data de revogação e o motivo podem ser registrados como metadados (opcional, mas recomendado).