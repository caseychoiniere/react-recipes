import React from 'react';

const Error = ({error}) => ( <p style={{color: 'red'}}>{error.message}</p> );

export default Error;