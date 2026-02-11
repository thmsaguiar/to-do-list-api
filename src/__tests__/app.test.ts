import request from "supertest";
import app from "../app";

describe("Tasks API", () => {
  let taskId: string;

  // Mock para suprimir logs de erro durante testes
  let consoleErrorMock: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorMock.mockRestore();
  });


  // Testes - HEALTH
  describe("GET /health", () => {
    it("Deve retornar status ok (Teste positivo)", async () => {
      const res = await request(app).get("/health");

      expect(res.status).toBe(200); // Status de retorno deve ser 200
      expect(res.body.status).toBe("ok"); // Status deve ser ok
      expect(typeof res.body.uptime).toBe("number"); // Tipo de dado do uptime deve ser numero
      expect(new Date(res.body.timestamp)).toBeInstanceOf(Date); // O timestamp deve ser o de agora
    });

    it("Deve retornar 404 para rota invalida (Not Found)", async () => {
      const res = await request(app).get("/health-invalid");
      expect(res.status).toBe(404); // Status de retorno deve ser 404
    });
  });


  // Testes - Criação de tarefa
  describe("POST /tasks", () => {
    it("Deve criar uma nova tarefa (Teste positivo)", async () => {
      const res = await request(app)
        .post("/tasks")
        .send({ title: "Minha nova task" });

      expect(res.status).toBe(201); // Status de retorno deve ser 201
      expect(res.body).toHaveProperty("id"); // O retorno deve conter o id da nova atividade
      expect(res.body.title).toBe("Minha nova task"); // O titulo deve ser o mesmo da requisicao
      expect(res.body.completed).toBe(false); // O completed deve ser iniciado como false

      // Verifica meta
      expect(res.body.meta).toHaveProperty("resourceType", "Task"); // Deve ter a propriedade resourceType e seu valor deve ser Task
      expect(res.body.meta).toHaveProperty("created"); // Deve ter a propriedade created
      expect(res.body.meta).toHaveProperty("lastModified"); // Deve ter a propriedade lastModified
      expect(res.body.meta).toHaveProperty("location"); // Deve ter a propriedade location

      taskId = res.body.id;
    });

    it("Deve falhar se o titulo da tarefa for curto (Bad Request)", async () => {
      const res = await request(app).post("/tasks").send({ title: "a" });

      expect(res.status).toBe(400); // Status de retorno deve ser 400
      expect(res.body.message).toBe("O campo Title deve ser preenchido e deve conter mais do que 3 caracteres");
    });

    it("Deve falhar se não houver titulo (Bad Request)", async () => {
      const res = await request(app).post("/tasks").send({});
      expect(res.status).toBe(400); // Status de retorno deve ser 400
    });
  });

  // Testes - Paginação
  describe("GET /tasks", () => {
    beforeEach(async () => {
      // Garante 3 tasks para testar paginação
      await request(app).post("/tasks").send({ title: "Task 1" });
      await request(app).post("/tasks").send({ title: "Task 2" });
      await request(app).post("/tasks").send({ title: "Task 3" });
    });

    afterEach(async () => {
      // Limpa todas as tasks
      const tasksRes = await request(app).get("/tasks");
      for (const t of tasksRes.body.data) {
        await request(app).delete(`/tasks/${t.id}`); // Remove todas as tarefas depois do teste
      }
    });

    it("Deve retornar as atividades paginadas (Teste positivo)", async () => {
      const res = await request(app).get("/tasks").query({ page: 1, limit: 2 });

      expect(res.status).toBe(200); // Status de retorno deve ser 200
      expect(res.body.page).toBe(1); // Página deve ser 1
      expect(res.body.limit).toBe(2); // Limite deve ser 2
      expect(res.body.total).toBeGreaterThanOrEqual(3); // Total de tarefas deve ser maior ou igual a 3
      expect(res.body.totalPages).toBeGreaterThanOrEqual(2); // Numero de página deve ser maior ou igual a 2
      expect(res.body.data.length).toBeLessThanOrEqual(2); // O tamnho do dado deve ser menor ou igual ao limit (2)
    });

    it("Deve limitar o máximo de tarefas por página (Teste negativo)", async () => {
      const res = await request(app).get("/tasks").query({ limit: 1000 });
      expect(res.status).toBe(200); // Status de retorno deve ser 200
      expect(res.body.limit).toBeLessThanOrEqual(100); // Limite máximo 100
    });
  });

  // Teste - Busca tarefa por ID
  describe("GET /tasks/:id", () => {
    beforeEach(async () => {
      const res = await request(app).post("/tasks").send({ title: "Task GET" }); // Adiciona atividade para teste de busca
      taskId = res.body.id;
    });

    afterEach(async () => {
      await request(app).delete(`/tasks/${taskId}`); // Remove a atividade depois do teste
    });

    it("Deve retornar a tarefa pelo ID (Teste positivo)", async () => {
      const res = await request(app).get(`/tasks/${taskId}`);
      expect(res.status).toBe(200); // Status de retorno deve ser 200
      expect(res.body.id).toBe(taskId); // O id da atividade retornada deve ser igual ao id solicitado
    });

    it("Deve retornar 404 se não encontrar a tarefa (Not Found)", async () => {
      const res = await request(app).get("/tasks/invalid-id");
      expect(res.status).toBe(404); // Status de retorno deve ser 404
      expect(res.body.message).toBe("Tarefa não encontrada");
    });
  });

  // Teste - Atualizar tarefa
  describe("PUT /tasks/:id", () => {
    beforeEach(async () => {
      const res = await request(app).post("/tasks").send({ title: "Task PUT" }); // Adicionando uma atividade para atualizar depois
      taskId = res.body.id;
    });

    afterEach(async () => {
      await request(app).delete(`/tasks/${taskId}`); // Remove a atividade depois do teste
    });

    it("Deve atualizar a tarefa (Teste positivo)", async () => {
      const res = await request(app).put(`/tasks/${taskId}`).send({ title: "Atualizada" });
      expect(res.status).toBe(200); // Status de retorno deve ser 200
      expect(res.body.title).toBe("Atualizada"); // O titulo da atividade deve ter sido alterado para o enviado no corpo da requisição
    });

    it("Deve retornar 404 se a tarefa não for encontrada (Not Found)", async () => {
      const res = await request(app).put("/tasks/invalid-id").send({ title: "Test" });
      expect(res.status).toBe(404); // Status de retorno deve ser 404
      expect(res.body.message).toBe("Tarefa não encontrada");
    });

    it("Deve falhar se o titulo da tarefa for curto (Bad Request)", async () => {
      const res = await request(app).put(`/tasks/${taskId}`).send({ title: "a" });
      expect(res.status).toBe(400); // Status de retorno deve ser 400
      expect(res.body.message).toBe("O campo Title deve ser preenchido e deve conter mais do que 3 caracteres");
    });
  });

  // Teste - Alternar o status de concluído
  describe("PATCH /tasks/:id/completed", () => {
    beforeEach(async () => {
      const res = await request(app).post("/tasks").send({ title: "Task PATCH" }); // Adiciona atividade para teste de alternar status
      taskId = res.body.id;
    });

    afterEach(async () => {
      await request(app).delete(`/tasks/${taskId}`); // Remove a atividade depois do teste
    });

    it("Deve alternar o status de completed (Teste positivo)", async () => {
      const res = await request(app).patch(`/tasks/${taskId}/completed`);
      expect(res.status).toBe(200); // Status de retorno deve ser 200
      expect(res.body.completed).toBe(true);

      const res2 = await request(app).patch(`/tasks/${taskId}/completed`);
      expect(res2.body.completed).toBe(false);
    });

    it("Deve retornar 404 se a tarefa não for encontrada (Not Found)", async () => {
      const res = await request(app).patch("/tasks/invalid-id/completed");
      expect(res.status).toBe(404); // Status de retorno deve ser 404
      expect(res.body.message).toBe("Tarefa não encontrada");
    });
  });

  // Teste - Remover Atividade
  describe("DELETE /tasks/:id", () => {
    beforeEach(async () => {
      const res = await request(app).post("/tasks").send({ title: "Task DELETE" }); // Adiciona atividade para teste de remover
      taskId = res.body.id;
    });

    it("Deve remover a atividade (Teste positivo)", async () => {
      const res = await request(app).delete(`/tasks/${taskId}`);
      expect(res.status).toBe(204); // Status de retorno deve ser 204
    });

    it("Deve retornar 404 se a tarefa não for encontrada (Not Found)", async () => {
      const res = await request(app).delete("/tasks/invalid-id");
      expect(res.status).toBe(404); // Status de retorno deve ser 404
      expect(res.body.message).toBe("Tarefa não encontrada");
    });
  });
});
