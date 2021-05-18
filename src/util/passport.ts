
import passport from 'passport';
import config from 'config';
import LocaclStrategy from 'passport-local';
import GoogleStrategy from 'passport-google-oauth20';
import FacebookStrategy from 'passport-facebook';

import User from '../models/user.model';

passport.use(
    new LocaclStrategy.Strategy(
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

passport.use(
    new GoogleStrategy.Strategy({
        clientID: config.get('googleClientId'),
        clientSecret: config.get('googleSecret'),
        callbackURL: config.get('googleCallback')
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const [user] = await User.findOrCreate({
                where: {
                    username: profile.emails![0].value,
                    auth_type: 'google'
                }
            });

            return done(null, user, { message: 'Authentication successful!' });
        } catch (err) {
            console.log(err);
            return done(err, false, { message: err.message });
        }
    })
);

passport.use(
    new FacebookStrategy.Strategy({
        clientID: config.get('fbAppId'),
        clientSecret: config.get('fbSecret'),
        callbackURL: config.get('fbCallback')
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const [user] = await User.findOrCreate({
                where: {
                    username: profile.id,
                    auth_type: 'facebook'
                }
            });

            return done(null, user, { message: 'Authentication successful!' });
        } catch (err) {
            console.log(err);
            return done(err, false, { message: err.message });
        }
    })
);

export default passport;