import React from 'react';
import { Mutation } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { SIGNIN_USER } from "../../queries";
import Error from '../Error';

const initialState = {
    username: "",
    password: ""
};

class Signin  extends React.Component {

    state = { ...initialState };

    clearState = () => this.setState({ ...initialState });

    handleChange = e => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    };

    handleSubmit = (e, signinUser) => {
        e.preventDefault();
        signinUser().then(async ({ data }) => {
            localStorage.setItem('token', data.signinUser.token);
            await this.props.refetch();
            this.clearState();
            this.props.history.push('/');
        });
    };

    validateForm = () => {
        const { username, password } = this.state;
        return !username || !password;
    };

    render() {
        const { username, password } = this.state;
        return (
            <div className="App">
                <h2 className="App">Signin</h2>
                <Mutation mutation={SIGNIN_USER} variables={{ username, password }}>
                    {(signinUser, { data, loading, error }) => {
                        return (
                            <form className="form" onSubmit={e => this.handleSubmit(e, signinUser)}>
                                <input type="text"
                                       name="username"
                                       placeholder="Username"
                                       value={username}
                                       onChange={this.handleChange}
                                />
                                <input type="password"
                                       name="password"
                                       placeholder="Password"
                                       value={password}
                                       onChange={this.handleChange}
                                />
                                <button type="submit"
                                        disabled={loading || this.validateForm()}
                                        className="button-primary"
                                >
                                    Signin
                                </button>
                                {error && <Error error={error}/>}
                            </form>  )
                    }}
                </Mutation>
            </div>
        )
    }
}

export default withRouter(Signin);