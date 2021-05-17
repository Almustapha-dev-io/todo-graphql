
import passport from 'passport';
import { Strategy } from 'passport-local';

import User from '../models/user.model';

passport.use(
    new Strategy(
        {
            usernameField: 'username',
            passwordField: 'password'
        },
        async (username, password, done) => {
            try {
                const user = await User.findOne({ where: { username } });
                if (!user) return done(null, false, { message: 'User not found!' });

                
                const validPassword = await user.passwordValid(password);
                if (!validPassword) return done(null, false, { message: 'Invalid password!' });

                return done(null, user, { message: 'Authentication successful!' });
            } catch (err) {
                console.log(err);
                return done(err);
            }
        }
    )
);

export default passport;