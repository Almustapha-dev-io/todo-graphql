import validator from 'validator';
import { Request } from 'express';

import { CustomError } from '../models/custom-errors';

import { getTodo, getTodos, createTodo, deleteTodo } from './resolvers/todo.resolvers';
import { getTodoItems, addTodoItem, updateTodoItem } from './resolvers/todo-item.resolvers';

import User from '../models/user.model';

import { UserType } from '../types/custom-types';

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

    getTodos,

    getTodo,

    createTodo,

    deleteTodo,

    getTodoItems,

    addTodoItem,

    updateTodoItem
};