
export interface UserType {
    id?: number;
    username: string;
    password: string;
    authType?: string;
    auth_type?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface TodoItemType {
    id: string;
    name: string;
    from: string;
    to: string;
    todoId: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface TodoType {
    id: string;
    description: string;
    UserId: string;
    Todo_Items: TodoItemType[];
    createdAt?: string;
    updatedAt?: string;
}

export interface TodoItemInput {
    name: string;
    description: string;
    fromDate: string;
    toDate: string;
}