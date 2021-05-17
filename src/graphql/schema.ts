
import { buildSchema } from 'graphql';

export default buildSchema(`
    type User {
        id: String!
        username: String!
        password: String!
        authType: String!
        createdAt: String
        updatedAt: String
    }

    type Todo {
        id: String!
        description: String!
        userId: String!
        items: [TodoItem!]
        createdAt: String!
        updatedAt: String!
    }
    
    type TodoItem {
        id: String!
        name: String!
        from: String!
        to: String!
        status: String!
        todoId: Int!
        createdAt: String!
        updatedAt: String!
    }

    input UserInputData {
        username: String!
        password: String!
    }

    input TodoItemInputData {
        name: String!
        description: String!
        fromDate: String!
        toDate: String!
    }

    input TodoItemUpdateInputData {
        name: String,
        description: String,
        fromDate: String,
        toDate: String
    }

    type RootQuery {
        getTodos: [Todo!]!
        getTodo(todoId: Int!): Todo!
        getTodoItems(todoId: Int!): [TodoItem!]!
    }

    type RootMutation {
        register(userInput: UserInputData!): User!
        createTodo(description: String!): Todo!
        deleteTodo(todoId: Int!): Todo!
        addTodoItem(todoId: Int!, todoItemInput: TodoItemInputData!): TodoItem!
        updateTodoItem(todoItemId: Int!, todoItemInput: TodoItemUpdateInputData!): TodoItem!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);