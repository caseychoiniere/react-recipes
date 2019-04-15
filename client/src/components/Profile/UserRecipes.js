import React from 'react';
import { Link } from 'react-router-dom';
import { Query, Mutation } from 'react-apollo';
import { GET_USER_RECIPES, DELETE_USER_RECIPE, GET_ALL_RECIPES, GET_CURRENT_USER } from '../../queries';
import Error from "../Error";
import RecipeItem from "../Recipe/RecipeItem";
import LoadingError from "../LoadingError";

const handleDelete = deleteUserRecipe => {
    const confirmDelete = window.confirm('Are you sure you want to delete this recipe?');
    if(confirmDelete) {
        deleteUserRecipe().then(({ data }) => {});
    }
};

const UserRecipes = ({ username }) => (
    <Query query={GET_USER_RECIPES} variables={{ username }}>
        {({ data, loading, error }) => {
            if(loading || error) return <LoadingError loading={loading} error={error}/>;
            return (
                <ul className="App">
                    <h3>Your Recipes</h3>
                    {
                        !data.getUserRecipes.length &&
                        <strong>
                            <p>You don't have any recipes yet. Add some!</p>
                        </strong>
                    }
                    {data.getUserRecipes.map(recipe => (
                        <li key={recipe._id}>
                            <Link to={`/recipes/${recipe._id}`}><p>{recipe.name}</p></Link>
                            <p style={{marginBottom: 0}}>Likes: {recipe.likes}</p>
                            <Mutation
                                mutation={DELETE_USER_RECIPE}
                                variables={{ _id: recipe._id }}
                                refetchQueries={() => [
                                    { query: GET_ALL_RECIPES },
                                    { query: GET_CURRENT_USER }
                                ]}
                                update={(cache, { data: { deleteUserRecipe } }) => {
                                    const { getUserRecipes } = cache.readQuery({
                                        query: GET_USER_RECIPES,
                                        variables: { username }
                                    });
                                    cache.writeQuery({
                                        query: GET_USER_RECIPES,
                                        variables: { username },
                                        data: {
                                           getUserRecipes: getUserRecipes.filter(
                                               recipe => recipe._id !== deleteUserRecipe._id
                                           )
                                        }
                                    })
                                }}
                            >
                                {deleteUserRecipe => {
                                    return (
                                        <p onClick={() => handleDelete(deleteUserRecipe)}
                                           className="delete-button"
                                        >
                                            X
                                        </p>
                                    )
                                }}
                            </Mutation>
                        </li>
                    ))}
                </ul>
            )
        }}
    </Query>
);

export default UserRecipes;