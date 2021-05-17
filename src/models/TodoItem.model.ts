import { DATE, ENUM, INTEGER, STRING } from 'sequelize';
import sequelize from '../util/db';

const TodoItem = sequelize.define('Todo_Item', {
    id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    name: {
        type: STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: STRING,
        allowNull: true,
        defaultValue: null
    },
    from_date: {
        type: DATE,
        allowNull: false
    },
    to_date: {
        type: DATE,
        allowNull: false
    },
    status: {
        type: ENUM('pending', 'completed'),
        allowNull: false,
        defaultValue: 'pending'
    }
});

TodoItem.beforeCreate((todoItem, options) => {
    const fromDate = new Date(todoItem.get('from_date') as string);
    const fromDateTime = fromDate.getTime();

    const toDate = new Date(todoItem.get('to_date') as string);
    const toDateTime = toDate.getTime();

    const today = new Date();
    const todayTime = today.getTime();

    if (fromDateTime < todayTime)  {
        throw new Error(`From date ${fromDate.toLocaleString()} must not be before ${today.toLocaleString()}`);
    }
    
    if (toDateTime <= fromDateTime) {
        throw new Error(`To date ${toDate.toLocaleString()} must be after or equal to ${fromDate.toLocaleString()}`);
    }
});

TodoItem.beforeUpdate((todoItem, options) => {
    const fromDate = new Date(todoItem.get('from_date') as string);
    const fromDateTime = fromDate.getTime();

    const toDate = new Date(todoItem.get('to_date') as string);
    const toDateTime = toDate.getTime();

    const today = new Date();
    const todayTime = today.getTime();

    if (fromDateTime < todayTime)  {
        throw new Error(`From date ${fromDate.toLocaleString()} must not be before ${today.toLocaleString()}`);
    }
    
    if (toDateTime <= fromDateTime) {
        throw new Error(`To date ${toDate.toLocaleString()} must be after or equal to ${fromDate.toLocaleString()}`);
    }
})


export default TodoItem;