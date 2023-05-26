import React from 'react';
import '../index.css'

import PropTypes from "prop-types";



export default function AddRemoveVariableButton(props) {

    function showButton(text, funcVariables) {
        return (
            <p className={"button_add_remove_variables"} onClick={() => {
                if(props.variables) {
                    let variables = props.variables
                    variables = funcVariables(variables)
                    props.handler(variables)
                }
            }}>{text}</p>
        )
    }

    function addVariable(variables) {
        variables.push(props.object)
        return variables
    }

    function removeVariable(variables) {
        variables.pop()
        return variables
    }

    return (
        <div>
            {showButton("+", addVariable)}
            {showButton("-", removeVariable)}
        </div>
    )


    AddRemoveVariableButton.propTypes = {
        handler: PropTypes.func,
        variables: PropTypes.array,
        object: PropTypes.any
    }
}
