
import { Request, Response, NextFunction } from 'express';

import passport from '../util/passport';

import { CustomError } from '../models/custom-errors';
import User from '../models/user.model';


export const localAuth = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err: any, user: User, info: any) => {
        try {
            if (err || !user) {
                const error = new CustomError(info.message);
                error.code = 401;
                throw error;
            }
    
            const token = user.generateAuthToken();
            res.status(200).json({
                message: info.message,
                token
            });
        } catch (err) {
            next(err);
        }
    })(req, res, next);
};

export const googleAuth = passport.authenticate('google', { scope: ['email', 'profile'] });

export const googleAuthCallback = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', { scope: ['email', 'profile'] }, (err: any, user: User, info: any) => {
        try {
            if (err || !user) {
                const error = new CustomError(info.message);
                error.code = 401;
                throw error;
            }
    
            const token = user.generateAuthToken();
            res.status(200).json({
                message: info.message,
                token
            });
        } catch (err) {
            next(err);
        }
    })(req, res, next);
};

export const fbAuth = passport.authenticate('facebook');

export const fbAuthcallback = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('facebook', (err: any, user: User, info: any) => {
        try {
            if (err || !user) {
                const error = new CustomError(info.message);
                error.code = 401;
                throw error;
            }
    
            const token = user.generateAuthToken();
            res.status(200).json({
                message: info.message,
                token
            });
        } catch (err) {
            next(err);
        }
    })(req, res, next);
};
