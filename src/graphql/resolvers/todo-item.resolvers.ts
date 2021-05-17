import { Request } from 'express';
import validator from 'validator';

import { CustomError } from '../../models/custom-errors';
import Todo from '../../models/todo.model';
import TodoItem from '../../models/TodoItem.model';

import { TodoItemInput } from '../../types/custom-types';

export const getTodoItems = async (args: any, req: Request)  => {
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
};

export const addTodoItem = async (args: any, req: Request) => {
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
};

export const updateTodoItem =  async (args: any, req: Request) => {
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
};