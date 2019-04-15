import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import './index.css';
import AddRecipe from './components/Recipe/AddRecipe';
import App from './components/App';
import Navbar from './components/Navbar';
import Profile from './components/Profile/Profile';
import RecipePage from './components/Recipe/RecipePage';
import Search from './components/Recipe/Search';
import Signin from './components/Auth/Signin';
import Signup from './components/Auth/Signup';
import withSession from './components/withSession';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

const client = new ApolloClient({
    uri: 'https://recipes-gql-apollo.herokuapp.com/graphql',
    // uri: 'http://localhost:4444/graphql',
    fetchOptions: {
        credentials: 'include'
    },

    request: operation => {
        const token = localStorage.getItem('token');
        operation.setContext({
            headers: {
                authorization: token
            }
        })
    },

    onError: ({ netWorkError }) => {
        if(netWorkError) {
            console.log(`Network Error ${netWorkError}`);
            if(netWorkError.statusCode === 401) {
                localStorage.removeItem('token');
            }
        }
    }
});

const Root = ({ refetch, session }) => (
  <Router>
      <Fragment>
          <Navbar session={session}/>
          <Switch>
              <Route path="/" exact component={App} />
              <Route path="/search" exact component={Search} />
              <Route path="/recipe/add" exact render={ () => <AddRecipe session={session} />} />
              <Route path="/recipes/:_id" exact component={RecipePage} />
              <Route path="/profile" exact render={ () => <Profile session={session} />} />
              <Route path="/signin" render={() => <Signin refetch={refetch} />} />
              <Route path="/signup" render={() => <Signup refetch={refetch} />} />
              <Redirect to="/" />
          </Switch>
      </Fragment>
  </Router>
);

const RootWithSession = withSession(Root);

ReactDOM.render(
    <ApolloProvider client={client}>
        <RootWithSession />
    </ApolloProvider>,
    document.getElementById('root')
);