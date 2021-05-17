import express from 'express';

import enableCors from './startup/cors';
import verifyConfig from './startup/config';
import setAssociations from './startup/associations';

import graphql from './controllers/graphql.controller';

import sequelize from './util/db';
import passport from './util/passport';
import User from './models/user.model';

const app = express();
app.use(express.json());

verifyConfig();
enableCors(app);

app.use(async (req, res, next) => {
    const user = await User.findByPk(1);

    req.user = user!;
    next();
});

app.use(passport.initialize());

app.use('/graphql', graphql);

async function init() {
    try {

        setAssociations();

        await sequelize.sync();
        console.log(`Connected to DB successfully!`);
        
        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => {
            console.log(`App listening on ${PORT}...`);
        });
    } catch (err) {
        console.log(err);
    }
}

init();