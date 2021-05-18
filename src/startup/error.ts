
import { Request, Response, NextFunction } from 'express';

import { CustomError } from '../models/custom-errors';

const error = (error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(error);
    let status = 500;
    let message = error.message ;
    let data;
    
    if (error instanceof CustomError) {
        status = error.code;
        data = error.data
    }

    res.status(status).json({ message, data });
};

export default error;

