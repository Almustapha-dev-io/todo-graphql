import { Model, INTEGER, STRING } from 'sequelize';
import sequelize from '../util/db';

class Todo extends Model {}

Todo.init(
    {
        id: {
            type: INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        description: {
            type: STRING,
            allowNull: false
        }
    },
    {
        modelName: 'Todo',
        sequelize
    }
);

export default Todo;