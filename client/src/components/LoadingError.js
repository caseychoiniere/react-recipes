import React from 'react';
import Error from "./Error";

export const LoadingOrError = ({ loading, error }) => (
    loading ? <div>loading</div> : <Error error={error}/>
);

export default LoadingOrError;