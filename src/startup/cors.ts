import { Request, Response, NextFunction, Express } from 'express';

const cors = (app: Express) => {    
    app.use((req: Request, res: Response, next: NextFunction) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    
        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }
    
        next();
    });
}

export default cors;

