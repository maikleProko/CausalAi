import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import PropTypes from "prop-types";



export default function InputField(props) {

    function Update(e) {
        if(props.type === "file") {
            props.handler(e.target.files[0])
        } else {
            props.handler(e.target.value)
        }
    }

    return (
        <>
            <p>
                {props.title}
            </p>
            <input className = {props.className} type={props.type}
                   onChange = {
                       (e) => {
                           Update(e)
                        }
                   }
            />
        </>
    )


    InputField.propTypes = {
        title: PropTypes.string,
        type: PropTypes.string,
        className: PropTypes.string,
        handler: PropTypes.func
    }
}
