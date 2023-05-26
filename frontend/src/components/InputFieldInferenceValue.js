import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import PropTypes from "prop-types";
import '../index.css'
import AddRemoveVariableButton from "./AddRemoveVariableButton";
import {forEach} from "react-bootstrap/ElementChildren";



export default function InputFieldInferenceValue(props) {

    function Update(e, indexVariable, property) {
        let variables = props.variables
        variables[indexVariable][property.title] = e.target.value
        props.handler(variables)
    }

    function handler(variables) {
        props.handler(variables)
    }


    function showAddRemoveVariableButton() {
        if(props.isMany) {
            return (
                <AddRemoveVariableButton
                    handler={(variables) => {
                        handler(variables)
                    }}
                    variables={props.variables}
                    object={props.object}
                />
            )
        }
    }

    function showInput(variable, property, indexVariable) {
        return (
                <input
                    className={"field_inference_value_properties"}
                    type={property.type}
                    onChange = {
                        (e) => {
                            Update(e, indexVariable, property)
                        }
                    }
                />
        )
    }

    function showOptions(options, property, indexVariable) {
        return options.map((option) => {
            return (
                <option
                    value={option}
                    onChange = {
                        (e) => {
                            Update(e, indexVariable, property)
                        }
                    }
                >
                    {option}
                </option>
            )
        })
    }

    function showSelect(variable, property, indexVariable) {
        return (
                <select className={"field_inference_value_properties"}
                        onChange = {
                            (e) => {
                                Update(e, indexVariable, property)
                            }
                        }
                >
                    {showOptions(property.options, property, indexVariable)}
                </select>
        )
    }

    function showPropertyValue(variable, property, indexVariable) {
        if(property.class === "input") {
            return showInput(variable, property, indexVariable)
        } else {
            return showSelect(variable, property, indexVariable)
        }
    }

    function showProperty(variable, property, indexVariable) {
        return (
            <div className="field_inference_value_element">
                <p>{property.title}</p>
                {showPropertyValue(variable, property, indexVariable)}
            </div>
        )
    }

    function showProperties(variable, properties, indexVariable) {
        return properties.map((property) => {
            return showProperty(variable, property, indexVariable)
        })
    }

    function showVariable(variable, properties, indexVariable) {
        return (
            <div>
                {showProperties(variable, properties, indexVariable)}
            </div>
        )
    }

    function showVariables(variables, properties) {
        if(variables && variables.length > 0) {
            return variables.map((variable, indexVariable) => {
                return showVariable(variable, properties, indexVariable)
            })
        } else {
            return (
                <>

                </>
            )
        }
    }

    function printTitle(variables) {
        if(variables && variables.length > 0) {
            return (
                <h>{props.title}</h>
            )

        } else {
            return (
                <></>
            )
        }

    }

    return (
        <div className={"field_inference_value"}>
            <div className={"field_inference_value_column"}>
                {printTitle(props.variables)}
            </div>

            <div className={"field_inference_value_column"}>
                {showVariables(props.variables, props.properties)}
            </div>

            <div className={"field_inference_value_column"}>
                {showAddRemoveVariableButton()}
            </div>

        </div>
    )


    InputFieldInferenceValue.propTypes = {
        title: PropTypes.string,
        csv: PropTypes.string,
        handler: PropTypes.func,
        isMany: PropTypes.bool,
        variables: PropTypes.any,
        properties: PropTypes.array,
        object: PropTypes.any
    }
}
