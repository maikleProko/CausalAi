import React, {useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import PropTypes from "prop-types";
import axios from 'axios'
import Graph from "./Graph";

const testCausalSource = {
    'type': 'Tabular',
    'elements': [1234,12345],
    'variables': ["var1", "var2"],
    'graph': {},
    'prior': [],
    'max_lag': null,
    'algorithm': 'PC',
    'ci_test': 'Partial Correlation',
    'pvalue': 0.02,
    'is_discrete': "true"
}
export default function MakeCausalGraphButton(props) {

    function makeResearch(csv) {
        let data = getCausalSource(csv)
        fetch(`http://127.0.0.1:5000/get_causal_graph`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body:  JSON.stringify(data)
        })
            .then(response => response.json())
            .then((data) => {
                    props.handler(data.graph_est)
                }
            );
    }

    function getCausalSource(csv) {
        let splitSign = ','
        if(hasSemicolon(csv)) {
            splitSign = ';'
        }

        return {
            'type': 'Tabular',
            'elements': getData(csv, splitSign, getVariables(csv, splitSign)),
            'variables': getVariables(csv, splitSign),
            'graph': {},
            'prior': getPriorKnowledge(),
            'max_lag': null,
            'algorithm': 'PC',
            'ci_test': 'Partial Correlation',
            'pvalue': 0.02,
            'isDiscrete': true
        }
    }

    function getData(csv, splitSign, variables) {
        let data = []
        let rows = csv.slice(csv.indexOf("\n") + 2);
        let tempFile =[]
        let splitArr = []

        for (let arr in rows) {
            let rowInserted = rows[arr].split(splitSign)
            splitArr.push(rowInserted)
        }
        splitArr = parseNumbers(splitArr)
        splitArr = parseOptions(splitArr)
        splitArr = parseNulls(splitArr)
        splitArr.pop()


        return splitArr
    }

    function getVariables(csv, splitSign) {
        return csv[0].replaceAll(' ', '_').slice(0, csv.indexOf("\n")).split(splitSign);
    }

    function getPriorKnowledge() {
        let priorKnowledgeArray = [] //TODO
        let priorKnowledge = {
            'forbidden_links': {},
            'existing_links': {},
            'root_nodes': [],
            'leaf_nodes': []
        }
        for(let i in priorKnowledgeArray){
            let specification = priorKnowledgeArray[i][0]
            let var1 = priorKnowledgeArray[i][1]
            let var2 = priorKnowledgeArray[i][2]
            if(specification == 'forbidden_links' || specification == 'existing_links'){
                if(!priorKnowledge[specification][var2]){
                    priorKnowledge[specification][var2] = []
                }
                priorKnowledge[specification][var2].push(var1)
            }
            else{
                if(var1 != null){
                    priorKnowledge[specification].push(var1);
                }
            }
        }
        return priorKnowledge
    }

    function isNumeric(str) {
        if (typeof str != "string") return false
        return !isNaN(str) && !isNaN(parseFloat(str))
    }

    function parseNumbers(data) {
        for(let i = 0; i < data.length; i++) {
            for(let j = 0; j < data[i].length; j++) {
                if(isNumeric(data[i][j])) {
                    data[i][j] = Number(data[i][j])
                }
            }
        }
        return data
    }

    function parseOptions(data) {
        for (let i = 0; i < data[0].length; i++) {
            if(typeof data[0][i] === 'string') {
                let variants = []
                for (let j = 0; j < data.length; j++) {
                    if(data[j][i] === "") {
                        data[j][i] = "Unknown"
                    }
                    if(!variants.filter(x => x === data[j][i]).length) {
                        variants.push(data[j][i])
                    }
                    data[j][i] = Number(variants.indexOf(data[j][i]))
                }
            } else {
                for (let j = 0; j < data.length; j++) {
                    if(data[j][i] === "") {
                        data[j][i] = -1
                    }
                }
            }
        }
        return data
    }


    function removeCommas(str, char) {
        let newStr = '';
        let insideQuotes = false;

        for (let i = 0; i < str.length; i++) {
            if (str[i] === char && !insideQuotes) {
                insideQuotes = true;
            } else if (str[i] === char && insideQuotes) {
                insideQuotes = false;
            }

            if (str[i] === ',' && insideQuotes) {
                newStr += '';
            } else {
                newStr += str[i];
            }
        }

        return newStr;
    }

    function removeCommasGeneral(str) {
        return removeCommas(str, '"')
    }

    function parseNulls(data) {
        for(let i = 0; i < data.length; i++) {
            for(let j = 0; j < data[i].length; j++) {
                if(data[i][j] === "") {
                    data[i][j] = 0
                }
            }
        }
        return data
    }

    function hasSemicolon(csv) {
        return csv[0].indexOf(';') > -1
    }

    function removeQuotes(csv) {
        for (let i = 0; i < csv.length; i++) {
            csv[i] = removeCommasGeneral(csv[i]).replaceAll('\"', '')
        }
        return csv
    }

    useEffect(() => {

    })

    return (
        <>
            <button type={"button"}
                    className={"btn btn-outline-primary"}
                    onClick={
                        () => {
                            makeResearch(removeQuotes(props.csv))
                        }
                    }
            >
                Причинно-следственный граф
            </button>

        </>

    )

    MakeCausalGraphButton.propTypes = {
        csv: PropTypes.string,
        handler: PropTypes.func
    }
}


