
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

    if(!config.get('googleClientId')) {
        throw new Error(errorMsg('google client id'));
    }

    if(!config.get('googleSecret')) {
        throw new Error(errorMsg('google secret'));
    }

    if(!config.get('googleCallback')) {
        throw new Error(errorMsg('google callback url'));
    }

    if(!config.get('fbAppId')) {
        throw new Error(errorMsg('facebook app id'));
    }

    if(!config.get('fbSecret')) {
        throw new Error(errorMsg('facebook secret'));
    }

    if(!config.get('fbCallback')) {
        throw new Error(errorMsg('facebook callback url'));
    }
};

export default verify;