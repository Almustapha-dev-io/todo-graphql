import { graphqlHTTP } from 'express-graphql';

import schema from '../graphql/schema';
import resolvers from '../graphql/resolvers';
import { CustomError } from '../models/custom-errors';

const gql = graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: true,
    customFormatErrorFn(err) {
        if (!err.originalError) return err;

        const message = err.message || 'Oops! an error occured!';
        let data, status = 500;
        if (err.originalError instanceof CustomError) {
            data = err.originalError.data;
            status = err.originalError.code;
        }
        
        return { data, message, status};
    }
});

export default gql;