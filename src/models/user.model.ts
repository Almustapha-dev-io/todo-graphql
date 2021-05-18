import { ENUM, INTEGER, Model, STRING } from 'sequelize';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from 'config';

import sequelize from '../util/db';

class User extends Model {
    generateAuthToken(): string {
        const id = this.get('id');
        const username = this.get('username');

        return jwt.sign(
            { id, username }, 
            config.get('jwtPrivatekey'), 
            { expiresIn: '1h' }
        );
    }

    async passwordValid(password: string): Promise<boolean> {
        const hashedPassword = this.get('password') as string;
        const isMatch = await bcrypt.compare(password, hashedPassword);

        return isMatch;
    }
}

User.init(
    {
        id: {
            type: INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        username: {
            type: STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: STRING,
            allowNull: true,
            defaultValue: null,
        },
        auth_type: {
            type: ENUM('local', 'facebook', 'twitter', 'google'),
            allowNull: false
        }
    },
    {
        modelName: 'User',
        sequelize
    }
);

User.beforeCreate(async (user, options) => {
    try {
        const username = user.get('username') as string;
        const password = user.get('password') as string;
        const authType = user.get('auth_type') as string;

        if (authType !== 'local') {
            return;
        }

        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            throw new Error(`User with username: ${username} already exists!`);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.set('password', hashedPassword);
    } catch (err) {
        throw err;
    }
});

export default User;
