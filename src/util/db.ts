import { Sequelize} from 'sequelize';
import config from 'config';

const sequelize = new Sequelize(
    config.get('database'),
    config.get('dbUsername'),
    config.get('dbPassword'),
    {
        dialect: config.get('dbDialect'),
        host: config.get('dbHost'),
        
    }
);

export default sequelize;