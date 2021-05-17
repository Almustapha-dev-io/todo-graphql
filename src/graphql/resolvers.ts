import validator from 'validator';
import { Request } from 'express';

import sequelize from '../util/db';

import { CustomError } from '../models/custom-errors';
import Todo from '../models/todo.model';
import TodoItem from '../models/TodoItem.model';
import User from '../models/user.model';

import { TodoItemInput, UserType } from '../types/custom-types';

export default {
    
    register: async (args: any, req: Request) => {
        const errors: any[] = [];
        const { username, password } = args.userInput as UserType;

        if (!validator.isEmail(username)) {
            errors.push({ message: 'Enter a valid email!' });
        }

        if (!validator.isLength(username, { min: 4 }) || validator.isEmpty(username)) {
            errors.push({ message: 'Username too short!'});
        }

        if (!validator.isLength(password, {min: 6, max: 24}) || validator.isEmpty(password)) {
            errors.push({ message: 'Password too short min 6 and max 24' });
        }

        if (errors.length > 0) {
            const error = new CustomError('Validation Error!');
            error.data = errors;
            error.code = 422;
            throw error
        }

        const createdUser = await User.create({ username, password, auth_type: 'local' });
        const user = createdUser.toJSON() as UserType;

        return {
            id: user.id,
            username: user.username,
            password: user.password,
            authType: user.auth_type,
            createdAt: new Date(user.createdAt!).toLocaleString(),
            updatedAt: new Date(user.updatedAt!).toLocaleString()
        };
    },

    getTodos: async (args: any, req: Request) => {
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
    },

    getTodo: async (args: any, req: Request) => {
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
    },

    createTodo: async (args: any, req: Request) => {
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
    },

    deleteTodo: async (args: any, req: Request) => {
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
    },

    getTodoItems: async (args: any, req: Request)  => {
        const todoId = args.todoId as number;
        const errors: any[] = [];

        if (!validator.isInt(todoId.toString()) || validator.isEmpty(todoId.toString())) {
            errors.push({ message: 'Invalid todo id!' });
        }   

        if (errors.length > 0) {
            const error = new CustomError('Input validation error!');
            error.code = 400;
            error.data = errors;
            throw error;
        }

        const user = req.user as any;
        const todos = await user.getTodos({
            where: { id: todoId },
            include: TodoItem
        });

        if (todos.length === 0) {
            const error = new CustomError(`Todo not found!`);
            error.code = 404;
            throw error;
        }

        const todo = todos[0].toJSON() as any;
        const items = todo.Todo_Items;

        return items.map((item: any) => {
            return {
                ...item,
                from: new Date(item.from_date).toLocaleString(),
                to: new Date(item.to_date).toLocaleString(),
                createdAt: new Date(item.createdAt!).toLocaleString(),
                updatedAt: new Date(item.updatedAt!).toLocaleString()
            }
        });
    },

    addTodoItem: async (args: any, req: Request) => {
        const todoId = args.todoId as number;
        const todoItemInput = args.todoItemInput as TodoItemInput;
        const { description, name, fromDate, toDate } = todoItemInput;

        const errors: any[] = [];
        if (!validator.isInt(todoId.toString()) || validator.isEmpty(todoId.toString())) {
            errors.push({ message: 'Todo Id is required!'});
        }

        if (validator.isEmpty(name) || !validator.isLength(name, { min: 3, max: 16 })) {
            errors.push({ message: 'Name must be betweeb 3 and 16 characters long!' });
        }
        
        if (validator.isEmpty(description) || !validator.isLength(description, { min: 3, max: 150 })) {
            errors.push({ message: 'Description must be betweeb 3 and 150 characters long!' });
        }

        if (!validator.isDate(fromDate) || validator.isEmpty(fromDate)) {
            errors.push({ message: 'From date invalid!' });
        }

        if (!validator.isDate(toDate) || validator.isEmpty(toDate)) {
            errors.push({ message: 'To date invalid!' });
        }

        if (errors.length > 0) {
            const error = new CustomError('Input Validation Error!');
            error.code = 422;
            error.data = errors;
            throw error;
        }

        const user = req.user as any;
        const todos: Todo[] = await user.getTodos({
            where: { id: todoId }
        }); 

        if (todos.length === 0) {
            const error = new CustomError(`Todo not found!`);
            error.code = 404;
            throw error;
        }

        const todo = todos[0] as any;
        const todoItem = await todo.createTodo_Item({
            name,
            description,
            from_date: fromDate,
            to_date: toDate
        });

        const todoItemAdded = await todo.hasTodo_Item(todoItem);
        if (!todoItemAdded) {
            const error = new CustomError(`Todo Item not added!`);
            error.code = 422;
            throw error;
        }

        const todoItemJson = todoItem.toJSON();

        return {
            ...todoItemJson,
            todoId: todoItemJson.TodoId,
            from: new Date(todoItemJson.from_date).toLocaleString(),
            to: new Date(todoItemJson.to_date).toLocaleString(),
            createdAt: new Date(todoItemJson.createdAt).toLocaleString(),
            updatedAt: new Date(todoItemJson.updatedAt).toLocaleString()
        };
    },

    updateTodoItem: async (args: any, req: Request) => {
        const todoItemId = args.todoItemId as number;
        const todoItemInput = args.todoItemInput as TodoItemInput;
        const { description, name, fromDate, toDate } = todoItemInput;
        
        const errors: any[] = [];
        if (!validator.isInt(todoItemId.toString()) || validator.isEmpty(todoItemId.toString())) {
            errors.push({ message: 'Todo Id is required!'});
        }

        if (name) {
            const nameHasError = validator.isEmpty(name) || !validator.isLength(name, { min: 3, max: 16 });

            if (nameHasError) {
                errors.push({ message: 'Name must be betweeb 3 and 16 characters long!' });
            }
        }
        
        if (description) {
            const descriptionHasError = validator.isEmpty(description) || !validator.isLength(description, { min: 3, max: 150 });

            if (descriptionHasError) {
                errors.push({ message: 'Description must be betweeb 3 and 150 characters long!' });
            }
        }

        if (fromDate) {
            const fromDateHasError = !validator.isDate(fromDate) || validator.isEmpty(fromDate);

            if (fromDateHasError) {
                errors.push({ message: 'From date invalid!' });
            }
        }

        if (toDate) {
            const toDateHasError = !validator.isDate(toDate) || validator.isEmpty(toDate);

            if (toDateHasError) {
                errors.push({ message: 'To date invalid!' });
            }
        }

        if (errors.length > 0) {
            const error = new CustomError('Input Validation Error!');
            error.code = 422;
            error.data = errors;
            throw error;
        }


        let todoItem = await TodoItem.findByPk(todoItemId);
        if (!todoItem) {
            const error = new CustomError('Todo item not found');
            error.code = 404;
            throw error;
        }

        todoItem = await todoItem.update({
            name: name? name : todoItem.get('name'),
            description: description ? description : todoItem.get('description'),
            from_date: fromDate ? fromDate : todoItem.get('from_date'),
            to_date: toDate ? toDate : todoItem.get('to_date')
        });

        const todoItemJson = todoItem.toJSON() as any;
        return {
            ...todoItemJson,
            todoId: todoItemJson.TodoId,
            from: new Date(todoItemJson.from_date).toLocaleString(),
            to: new Date(todoItemJson.to_date).toLocaleString(),
            createdAt: new Date(todoItemJson.createdAt).toLocaleString(),
            updatedAt: new Date(todoItemJson.updatedAt).toLocaleString()
        };
    }
};