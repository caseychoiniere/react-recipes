import React from 'react';
import { withRouter } from 'react-router-dom';
import { Mutation } from 'react-apollo';
import { ADD_RECIPE, GET_ALL_RECIPES, GET_USER_RECIPES } from "../../queries";
import Error from "../Error";
import withAuth from '../withAuth';

const initialState = {
    name: '',
    category: 'Breakfast',
    description: '',
    instructions: '',
    username: ''
};

class AddRecipe extends React.Component {

    state = { ...initialState };

    componentDidMount() {
        this.setState({
            username: this.props.session.getCurrentUser.username
        })
    }

    clearState = () => this.setState({ ...initialState });

    handleChange = e => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        });
    };

    handleSubmit = (e, addRecipe) => {
        e.preventDefault();
        addRecipe().then(({ data }) => {
            this.clearState();
            this.props.history.push('/');
        })
    };

    // Optimistic updates
    updateCache = (cache, { data: { addRecipe }}) => {
        // cache.readQuery() Reads a GraphQL query from the root query id
        const { getAllRecipes } = cache.readQuery({ query: GET_ALL_RECIPES })
        cache.writeQuery({
            query: GET_ALL_RECIPES,
            data: {
                getAllRecipes: [addRecipe, ...getAllRecipes]
            }
        });
    };

    validateForm = () => {
        const { name, category, description, instructions } = this.state;
        const isInvalid = !name || !category || !description || !instructions;
        return isInvalid;
    };

    render() {
        const { name, category, description, instructions, username } = this.state;

        return (
            <Mutation mutation={ADD_RECIPE}
                      variables={{ name, category, description, instructions, username }}
                      refetchQueries={() => [
                          { query: GET_USER_RECIPES, variables: { username } }
                      ]}
                      update={this.updateCache}
            >
                {(addRecipe, { data, loading, error }) => {
                    return (
                        <div className="App">
                            <h2 className="App">Add Recipe</h2>
                            <form className="form" onSubmit={e=> this.handleSubmit(e, addRecipe)}>
                                <input type="text"
                                       name="name"
                                       placeholder="Recipe Name"
                                       onChange={this.handleChange}
                                       value={name}
                                />
                                <select name="category"
                                        onChange={this.handleChange}
                                        value={category}
                                >
                                    <option value="Breakfast">Breakfast</option>
                                    <option value="Lunch">Lunch</option>
                                    <option value="Dinner">Dinner</option>
                                    <option value="Snack">Snack</option>
                                </select>
                                <input type="text"
                                       name="description"
                                       placeholder="Description"
                                       onChange={this.handleChange}
                                       value={description}
                                />
                                <textarea
                                    name="instructions"
                                    placeholder="Instructions"
                                    onChange={this.handleChange}
                                    value={instructions}
                                />
                                <button disabled={ loading || this.validateForm() } type="submit" className="button-primary">Submit</button>
                            </form>
                            {error && <Error error={error}/>}
                        </div>
                    );
                }}
            </Mutation>
        )
    }
};

export default withAuth(session => session && session.getCurrentUser)(withRouter(AddRecipe));