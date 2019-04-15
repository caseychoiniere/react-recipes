const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const createToken = (user, secret, expiresIn) => {
    const { username, email } = user;
    return jwt.sign({ username, email }, secret, { expiresIn });
};

exports.resolvers = {
        Query: {
            getAllRecipes: async (root, args, { Recipe }) => {
                return await Recipe.find().sort({createdDate: 'desc'});
            },

            getRecipe: async (root, { _id }, { Recipe }) => {
                return await Recipe.findOne({ _id });
            },


            searchRecipes: async (root, { searchTerm }, { Recipe }) => {
                if(searchTerm) {
                    return await Recipe.find({ // Return search results
                        $text: { $search: searchTerm },
                    }, {
                        score: { $meta: 'textScore'} // Set a score for the results based on how close it matches
                    }).sort({
                        score: { $meta: 'textScore'} // Sort results by score to get the most appropriate result
                    });
                } else { // Just return all items
                    return await Recipe.find().sort({
                        likes: 'desc',
                        createdDate: 'desc'
                    })
                }
            },

            getUserRecipes: async (root, { username }, { Recipe }) => {
                return await Recipe.find({ username }).sort({createdDate: 'desc'});
            },

            getCurrentUser: async (root, args, { currentUser, User }) => {
                if(!currentUser) return null;
                return await User.findOne({ username: currentUser.username })
                    .populate({
                        path: 'favorites',
                        model: 'Recipe'
                    });
            }
        },

        Mutation: {
            // root, args == schema fields, Context == models
            addRecipe: async (
                    root,
                    {name, category, description, instructions, username},
                    { Recipe }
                ) => {
                    const newRecipe = await new Recipe({
                        // Add fields needed to create new into the constructor
                        name,
                        category,
                        description,
                        instructions,
                        username
                    }).save();
                    return newRecipe;
            },

            deleteUserRecipe: async (root, { _id }, { Recipe }) => {
                return await Recipe.findOneAndRemove({ _id });
            },

            likeRecipe: async (root, { _id, username }, { Recipe, User }) => {
                const recipe = await Recipe.findOneAndUpdate({ _id }, { $inc: { likes: 1 } });
                const user = await User.findOneAndUpdate({ username }, { $addToSet: { favorites: _id } });
                return recipe;
            },

            unlikeRecipe: async (root, { _id, username }, { Recipe, User }) => {
                const recipe = await Recipe.findOneAndUpdate({ _id }, { $inc: { likes: -1 } });
                const user = await User.findOneAndUpdate({ username }, { $pull: { favorites: _id } });
                return recipe;
            },

            signinUser: async (root, { username, password }, { User }) => {
                const user = await User.findOne({ username });
                if(!user) throw new Error('User does not exist. Please sign up');
                const isValidPassword = await bcrypt.compare(password, user.password);
                if(!isValidPassword) throw new Error('Invalid Password');
                return { token: createToken(user, process.env.SECRET, '1hr') };
            },

            signupUser: async (root, { username, email, password }, { User }) => {
                const user = await User.findOne({ username });
                if(user) throw new Error('User already exists');
                const newUser = await new User({
                    username,
                    email,
                    password
                }).save();
                return { token: createToken(newUser, process.env.SECRET, '1hr') };
            }

        }
};