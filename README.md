# To-Do List API — Node.js + TypeScript

## <a name="description">Descrição</a>

API RESTful desenvolvida com foco em boas práticas de arquitetura backend, segurança, padronização de erros, testabilidade e escalabilidade.

O projeto foi construído simulando padrões utilizados em ambientes corporativos e APIs produtivas.

## Índice

1. [Descrição](#description)
2. [Arquitetura e Decisões Técnicas](#arquitetura)
3. [Modelagem do Recurso](#modelagem)
4. [Paginação Escalável](#paginacao)
5. [Estratégia de Testes](#teste)
6. [Documentação (OpenAPI 3.0)](#docs)
7. [Conformidade HTTP](#conformidade)
8. [Executando](#executando)
9. [Objetivo Técnico](#objectivo)
10. [Autor](#autor)

---

## <a name="arquitetura">🧠 Arquitetura e Decisões Técnicas </a>
### 1️⃣ Stack
- Node.js
- Express
- TypeScript
- Jest + Supertest
- Swagger (OpenAPI 3.0)
- Helmet
- CORS
- Express Rate Limit

### 2️⃣ Padrões Arquiteturais Aplicados
🔹 Separação de responsabilidades
```markdown
routes/         → Camada de roteamento
middlewares/    → Middlewares reutilizáveis
errors/         → Classes de erro customizadas
__tests__/      → Testes de integração
```

### 3️⃣ Error Handling Pattern

Foi implementado um middleware global de tratamento de erros, centralizando:

- Status code
- Mensagem padronizada
- Log da aplicação

Classe de erro customizada:
```ts
export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
```

Middleware centralizado:

- Trata erros esperados (HttpError)
- Retorna 500 para erros não tratados
- Evita vazamento de stack trace para o cliente

Esse padrão melhora:
- Manutenibilidade
- Observabilidade
- Consistência de respostas

---

## 🔐 Segurança Aplicada
### ✔ Remoção de fingerprint do servidor
```ts
app.disable('x-powered-by');
```

### ✔ Helmet

Proteção contra:
- Clickjacking
- XSS
- MIME sniffing
- Outros headers inseguros

### ✔ CORS configurado explicitamente

Controle de:
- Origem
- Métodos permitidos
- Headers permitidos

### ✔ Rate Limiting
```ts
windowMs: 15 minutos
max: 100 requisições por IP
```

Mitiga:
- Abuse patterns
- Brute force
- Denial-of-service básico

---

## <a name="modelagem">📦 Modelagem do Recurso</a>
Cada Task contém metadados estruturados:
```json
{
  "id": "uuid",
  "title": "string",
  "completed": false,
  "meta": {
    "resourceType": "Task",
    "created": "ISO Date",
    "lastModified": "ISO Date",
    "location": "URL do recurso"
  }
}
```

Motivação:
- `meta.location` → aproximação de HATEOAS
- `created` / `lastModified` → rastreabilidade
- `resourceType` → padronização futura para múltiplos recursos

---

## <a name="paginacao">📄 Paginação Escalável</a>

A listagem suporta:
```bash
GET /tasks?page=1&limit=10
```

Implementações importantes:
- Sanitização de query params
- Limite máximo configurável
- Cálculo de totalPages

Estrutura de resposta consistente
```json
{
  "page": 1,
  "limit": 10,
  "total": 50,
  "totalPages": 5,
  "data": []
}
```

---

##  <a name="teste">🧪 Estratégia de Testes</a>
Tipos de Testes
- Testes de integração
- Testes positivos (happy path)
- Testes negativos (bad request)
- Testes de erro (404)
- Teste de health check

Ferramentas:
- Jest
- Supertest

O projeto utiliza:
- `describe` para organização semântica
- `beforeAll` / `afterAll` quando necessário
- Assertivas específicas (`toHaveProperty`, `toBe`, etc.)

---

## <a name="docs">📖 Documentação (OpenAPI 3.0)</a>

Swagger configurado via `swagger-jsdoc`.

A documentação descreve:
- Schemas
- Query parameters
- Path parameters
- Response codes
- Tipagem de payload

Disponível em:
```bash
http://localhost:300/api-docs
```

---

## <a name="conformidade">📊 Conformidade HTTP</a>

Status codes utilizados corretamente:
- 200 → OK
- 201 → Created
- 204 → No Content
- 400 → Bad Request
- 404 → Not Found
- 500 → Internal Server Error

---

## <a name="executando">⚙️ Executando</a>
Instalar:
```bash
npm install
```

Desenvolvimento:
```bash
npm run dev
```

Testes:
```bash
npm test
```

Testes em watch:
```bash
npm run test:watch
```

---

## <a name="objetivo">🎯 Objetivo Técnico</a>

Este projeto demonstra:
- Conhecimento sólido de REST
- Estruturação profissional de APIs
- Segurança básica aplicada corretamente
- Tratamento de erro consistente
- Testabilidade
- Organização escalável

---

## <a name="autor">👨‍💻 Autor</a>

| [<img src="https://github.com/thmsaguiar.png?size=115" width=115><br><sub>@thmsaguiar</sub>](https://github.com/thmsaguiar) |
| :---: |
