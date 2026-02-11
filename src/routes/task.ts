import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { HttpError } from "../errors/HttpError";
const router = Router();

let tasks: Task[] = [];

interface Task {
  id: string;
  title: string;
  completed: boolean;
  meta: {
    resourceType: string;
    created: string;
    lastModified: string;
    location: string;
  };
}

// Funções utilitárias
const buildMeta = (id: string) => {
  const now = new Date().toISOString(); // Data de hoje em formato ISOString
  return {
    resourceType: "Task",
    created: now,
    lastModified: now,
    location: `http://localhost:3000/tasks/${id}`,
  };
};

const findTaskIndex = (id: string) => {
  return tasks.findIndex((t) => t.id === id);
};

// Rota GET
/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Lista tarefas com paginação
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Quantidade de itens por página
 *     responses:
 *       200:
 *         description: Lista de tarefas paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       completed:
 *                         type: boolean
 *                       meta:
 *                         type: object
 *                         properties:
 *                           resourceType:
 *                             type: string
 *                           created:
 *                             format: date-time
 *                             example: "2025-09-08T19:05:00Z"
 *                           lastModified:
 *                             format: date-time
 *                             example: "2025-09-08T19:05:00Z"
 *                           location:
 *                             type: string
 */
router.get("/", (req, res, next) => {
  try {
    // Paginação
    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1; // Página mínima/Default 1
    let limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 10; // Limite mínima/Default 10

    // Limite máximo de itens por página
    const maxLimit = 100;
    if (limit > maxLimit) limit = maxLimit;

    const startIndex = (page - 1) * limit; // Garante inicio baseado na pagina
    const endIndex = startIndex + limit;

    const data = tasks.slice(startIndex, endIndex); // Tarefas paginadas

    return res.status(200).json({
      page,
      limit,
      total: tasks.length,
      totalPages: Math.ceil(tasks.length / limit), // Arrendonda o total de páginas
      data,
    });
  } catch (err) {
    next(err); // Middleware de erro
  }
});

// Rota GET by Id
/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Buscar Tarefa por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador da Tarefa
 *     responses:
 *       404:
 *         description: Tarefa não encontrada
 *       200:
 *         description: Tarefa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  id:
 *                    type: string
 *                  title:
 *                     type: string
 *                  completed:
 *                     type: boolean
 *                  meta:
 *                     type: object
 *                     properties:
 *                        resourceType:
 *                          type: string
 *                        created:
 *                          format: date-time
 *                          example: "2025-09-08T19:05:00Z"
 *                        lastModified:
 *                          format: date-time
 *                          example: "2025-09-08T19:05:00Z"
 *                        location:
 *                           type: string
 */
router.get("/:id", (req, res, next) => {
  try {
    const id = req.params.id;
    const task = tasks.find((t) => t.id === id); // Busca a tarefa pelo id

    // Verifica se a tarefa existe, caso não, retorna erro
    if (!task) throw new HttpError(404, "Tarefa não encontrada");

    return res.status(200).json(task);
  } catch (err) {
    next(err); // Middleware de erro
  }
});

// Rota POST
/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Cria uma nova tarefa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Minha tarefa
 *     responses:
 *       201:
 *         description: Tarefa criada
 */
router.post("/", (req, res, next) => {
  try {
    const { title } = req.body;

    // Verificação de titulo e caracteres minimo
    if (!title || title.length < 3)
      throw new HttpError(
        400,
        "O campo Title deve ser preenchido e deve conter mais do que 3 caracteres",
      );

    const id = uuidv4(); // Gera Uuid
    const task = {
      id,
      title,
      completed: false,
      meta: buildMeta(id),  // Criação do meta dado
    };

    tasks.push(task); // Adiciona tarefa a lista

    return res.status(201).json(task);
  } catch (err) {
    next(err); // Middleware de erro
  }
});

// Rota PUT
/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Atualiza uma tarefa
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador da Tarefa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       404:
 *         description: Tarefa não encontrada
 *       200:
 *         description: Tarefa atualizada
 */
router.put("/:id", (req, res, next) => {
  try {
    const id = req.params.id;
    const index = tasks.findIndex((t) => t.id === id); // Busca a tarefa pelo id

    // Verifica se existe a tarefa com este id, caso não retorna erro 404
    if (index === -1) throw new HttpError(404, "Tarefa não encontrada");

    const { title } = req.body;

    // Verificação de titulo e caracteres minimo
    if (!title || title.length < 3)
      throw new HttpError(
        400,
        "O campo Title deve ser preenchido e deve conter mais do que 3 caracteres",
      );

    const existingTask = tasks[index]; // Busca a tarefa a ser alterada

    const updatedTask: Task = {
      id: existingTask.id,
      completed: existingTask.completed,
      title, // Modifica o titulo da tarefa
      meta: {
        ...existingTask.meta,
        lastModified: new Date().toISOString(), // Altera data de modificação
      },
    };

    tasks[index] = updatedTask; // Atualiza a tarefa na lista

    return res.status(200).json(tasks[index]);
  } catch (err) {
    next(err); // Middleware de erro
  }
});

// Rota PATCH
/**
 * @swagger
 * /tasks/{id}/completed:
 *   patch:
 *     summary: Atualiza completed de uma tarefa estilo toogle
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador da Tarefa
 *     responses:
 *       404:
 *         description: Tarefa não encontrada
 *       200:
 *         description: Tarefa atualizada
 */
router.patch("/:id/completed", (req, res, next) => {
  try {
    const id = req.params.id;
    const task = tasks.find((t) => t.id === id); // Busca tarefa por id

    // Verifica se a tarefa existe, caso não, retorna erro 404
    if (!task) throw new HttpError(404, "Tarefa não encontrada");

    task.completed = !task.completed; // Toggle automático
    task.meta.lastModified = new Date().toISOString(); // Data de modificação

    return res.status(200).json(task);
  } catch (err) {
    next(err); // Middleware de erro
  }
});

// Rota DELETE
/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Remove uma tarefa
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador da Tarefa
 *     responses:
 *       404:
 *         description: Tarefa não encontrada
 *       204:
 *         description: Tarefa removida
 */
router.delete("/:id", (req, res, next) => {
  try {
    const id = req.params.id;
    const index = findTaskIndex(id); // Busca tarefa pelo id

    // Verifica se a tarefa existe, caso não, retorna erro 404
    if (index === -1) throw new HttpError(404, "Tarefa não encontrada");

    tasks.splice(index, 1); // Remove da lista se a tarefa existir

    return res.status(204).send(); // Retorna apenas o status 204
  } catch (err) {
    next(err); // Middleware de erro
  }
});

export default router;
