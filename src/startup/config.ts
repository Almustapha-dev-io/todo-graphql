
import config from 'config';

const errorMsg = (param: string): string => {
    return `FATAL ERROR: ${param} undefined!`;
};

const verify = () => {

    if(!config.get('database')) {
        throw new Error(errorMsg('database'));
    }

    if(!config.get('dbUsername')) {
        throw new Error(errorMsg('db username'));
    }

    if(!config.get('dbPassword')) {
        throw new Error(errorMsg('db password'));
    }

    if(!config.get('dbHost')) {
        throw new Error(errorMsg('db host'));
    }

    if(!config.get('dbDialect')) {
        throw new Error(errorMsg('db dialect'));
    }

    if(!config.get('jwtPrivatekey')) {
        throw new Error(errorMsg('jwt secret'));
    }
};

export default verify;