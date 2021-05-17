import { Request } from 'express';
import validator from 'validator';

import sequelize from '../../util/db';

import { CustomError } from '../../models/custom-errors';
import Todo from '../../models/todo.model';
import TodoItem from '../../models/TodoItem.model';

export const getTodos =  async (args: any, req: Request) => {
    const user = req.user as any;

    const todos: Todo[] = await user.getTodos();
    
    return (todos as any[]).map(todo => {
        let todoJson = todo.toJSON() as any;
        return {
            ...todoJson,
            userId: todo.UserId,
            createdAt: new Date(todo.createdAt!).toLocaleString(),
            updatedAt: new Date(todo.updatedAt!).toLocaleString()
        }
    });        
};

export const getTodo = async (args: any, req: Request) => {
    const todoId = args.todoId as number;

    const errors: any[] = [];
    if (!validator.isInt(todoId.toString()) || validator.isEmpty(todoId.toString())) {
        errors.push({ message: 'Todo Id is required!'});
    }

    if (errors.length > 0) {
        const error = new CustomError('Input Validation failed!')
        error.code = 422;
        error.data = errors;
        throw error;
    }

    const user = req.user as any;
    const todos: Todo[] = await user.getTodos({
        where: { id: todoId },
        include: TodoItem
    });

    if (todos.length === 0) {
        const error = new CustomError(`Todo not found!`);
        error.code = 404;
        throw error;
    }

    const todo = todos[0].toJSON() as any;

    return {
        ...todo,
        userId: todo.UserId,
        items: todo.Todo_Items.map((item: any) => {
            return {
                ...item,
                from: new Date(item.from_date).toLocaleString(),
                to: new Date(item.to_date).toLocaleString(),
                createdAt: new Date(item.createdAt!).toLocaleString(),
                updatedAt: new Date(item.updatedAt!).toLocaleString()
            }
        }),
        createdAt: new Date(todo.createdAt!).toLocaleString(),
        updatedAt: new Date(todo.updatedAt!).toLocaleString()
    };
};

export const createTodo = async (args: any, req: Request) => {
    const description = args.description as string;

    const errors: any[] = [];
    if (validator.isEmpty(description) || !validator.isLength(description, { min: 4, max: 24 })) {
        errors.push({ message: 'Description must be between 4 and 24 characters long!'});
    }

    if (errors.length > 0) {
        const error = new CustomError('Input validation failed!');
        error.code = 422;
        error.data = errors;
        throw error;
    }

    const user = req.user as any;            
    const todo = await user.createTodo({ description });

    return {
        id: todo.get('id'),
        description: todo.get('description'),
        userId: todo.get('UserId'),
        createdAt: new Date(todo.get('createdAt') as string).toLocaleString(),
        updatedAt: new Date(todo.get('updatedAt') as string).toLocaleString()
    };
};

export const deleteTodo = async (args: any, req: Request) => {
    const todoId = args.todoId as number;

    const errors: any[] = [];
    if (!validator.isInt(todoId.toString()) || validator.isEmpty(todoId.toString())) {
        errors.push({ message: 'Todo Id is required!'});
    }

    if (errors.length > 0) {
        const error = new CustomError('Input Validation failed!')
        error.code = 422;
        error.data = errors;
        throw error;
    }

    const user = req.user as any;
    const todos = await user.getTodos({ where: { id: todoId }});

    if (todos.length === 0) {
        const error = new CustomError('Todo not found!');
        error.code = 404;
        throw error;
    }

    const transaction = await sequelize.transaction();
    const todo = todos[0];

    try {
        await user.removeTodo(todoId, { transaction });
        await todo.setTodo_Items([], { transaction });

        await Todo.destroy({ 
            where: { userId: null }, 
            transaction
        });

        await TodoItem.destroy({ 
            where: { todoId: null },
            transaction
        });

        await transaction.commit();

        const todoJson = todo.toJSON();
        return {
            ...todoJson,
            userId: todoJson.UserId,
            createdAt: new Date(todoJson.createdAt as string).toLocaleString(),
            updatedAt: new Date(todoJson.updatedAt as string).toLocaleString()
        };
    } catch (err) {
        await transaction.rollback();
        const error = new CustomError(err.message);
        error.code = 422;
        throw error;
    }
};