const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require('cors');
require('dotenv').config({path: 'variables.env'});
const Recipe = require('./models/Recipe');
const User = require('./models/User');

// Bring in GraphQL-Express middleware
const { graphiqlExpress, graphqlExpress } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const { typeDefs } = require('./schema');
const { resolvers } = require('./resolvers');

// Create schema
const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});

// Connect DB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log(`DB connected`))
    .catch(err => console.error(err));

// Initialize app
const app = express();

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
};

// Add CORS middleware
app.use(cors(corsOptions));

//Set up JWT auth middleware

app.use(async (req, res, next) => {
    const token = req.headers['authorization'];
    if(token !== 'null') {
        try {
            const currentUser = await jwt.verify(token, process.env.SECRET);
            req.currentUser = currentUser;
        } catch(err) {
            console.log(err)
        }
    }
    console.log(token, typeof  token);
    next();
})

// Create GraphiQl app
// app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql'}
//
// ));

// Connect schema with GraphQL
app.use(
    '/graphql',
    bodyParser.json(),
    graphqlExpress(({ currentUser }) => ({
        schema,
        context: {
            Recipe,
            User,
            currentUser
        }
    })
));

if(process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));
    app.get('*', (req,res) => {
        res.sendfile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const PORT = process.env.port || 4444;

app.listen(PORT, () => {
    console.log(`server listening on ${PORT}`)
});

