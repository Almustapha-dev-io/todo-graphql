import Todo from '../models/todo.model';
import TodoItem from '../models/TodoItem.model';
import User from '../models/user.model';

const setUp = () => {
    User.hasMany(Todo);
    Todo.belongsTo(User, {
        constraints: true,
        onDelete: 'CASCADE'
    });

    Todo.hasMany(TodoItem);
    TodoItem.belongsTo(Todo, {
        constraints: true,
        onDelete: 'CASCADE'
    });
};

export default setUp;