import logo from './logo.svg';
import './App.css';
import './components/MakeCausalGraphButton'
import MakeCausalGraphButton from "./components/MakeCausalGraphButton";
import './index.css'
import InputField from "./components/InputField";
import {useEffect, useState} from "react";
import Graph from "./components/Graph";
import InputFieldInferenceValue from "./components/InputFieldInferenceValue";
import PropTypes from "prop-types";
import MakeCausalInferenceButton from "./components/MakeCausalInferenceButton";

const TARGET_VARIABLE_PROPERTIES = [
    {title: "TargetVariableName", class: "select", options: []},
    {title: "Algorithm", class: "select", options: ["MLP Regression"]}
]

const TREATMENT_VARIABLE_PROPERTIES = [
    {title: "TreatmentVariableName", class: "select", options: []},
    {title: "TreatmentValue", class: "input", type: "text"},
    {title: "ControlValue", class: "input", type: "text"},
]

const CONDITION_VARIABLE_PROPERTIES = [
    {title: "ConditionVariableName", class: "select", options: []},
    {title: "ConditionValue", class: "input", type: "text"}
]


function App() {
    let [changeState, setChangeState] = useState(false)
    let [csv, setCsv] = useState("")
    let [graph, setGraph] = useState([])
    let [variables, setVariables] = useState([])

    let [targetVariables, setTargetVariables] = useState({})
    let [treatmentVariables, setTreatmentVariables] = useState([])
    let [conditionVariables, setConditionVariables] = useState([])

    let [targetVariablesProperties, setTargetVariablesProperties] = useState(TARGET_VARIABLE_PROPERTIES)
    let [treatmentVariablesProperties, setTreatmentVariablesProperties] = useState(TREATMENT_VARIABLE_PROPERTIES)
    let [conditionVariablesProperties, setConditionVariablesProperties] = useState(CONDITION_VARIABLE_PROPERTIES)

    let [isAteCalculated, setIsAteCalculated] = useState(false)
    let [estimateAte, setEstimateAte] = useState(0.0)


    useEffect(() => {
        if(variables.length > 0) {
            initVariables()
            initVariablesOptions()
        }
    }, [variables])

    useEffect(() => {

    }, [targetVariables, treatmentVariables, conditionVariables])

    function getVariableProperties(variablesProperties) {
        let variablePropertiesTemp = variablesProperties
        variablePropertiesTemp[0].options = variables
        return variablePropertiesTemp
    }

    function initVariablesOptions() {
        setTargetVariablesProperties(getVariableProperties(targetVariablesProperties))
        setTreatmentVariablesProperties(getVariableProperties(treatmentVariablesProperties))
        setConditionVariablesProperties(getVariableProperties(conditionVariablesProperties))
    }

    function initVariables() {
        let targetVariablesTemp = [{TargetVariableName: variables[0], Algorithm: "MLP Regression"}]
        let treatmentVariablesTemp = [{TreatmentVariableName: variables[0], TreatmentValue: 0, ControlValue: 0}]
        let conditionVariablesTemp = [{ConditionVariableName: variables[0], ConditionValue: 0}]

        setTargetVariables(targetVariablesTemp)
        setTreatmentVariables(treatmentVariablesTemp)
        setConditionVariables(conditionVariablesTemp)
    }

    function parse(file) {
        return new Promise((resolve, reject) => {
            let content = '';
            const reader = new FileReader();
            reader.onloadend = function(e) {
                content = e.target.result;
                const result = content.split(/\r\n|\n/);
                resolve(result);
            };
            reader.onerror = function(e) {
                reject(e);
            };
            reader.readAsText(file);
        });
    }

    function hasSemicolon(csv) {
        return csv[0].indexOf(';') > -1
    }

    function getFileReaderCsv(fileCsv) {
      parse(fileCsv).then(value => {
          let splitSign = ','
          if(hasSemicolon(value)) {
              splitSign = ';'
          }
          setVariables(value[0].replaceAll(' ', '_').slice(0, value.indexOf("\n")).split(splitSign))
          setCsv(value)
      });
    }

    function prepareGraph(graph) {
        for (var key in graph) {
            if (key === "") {
                Object.defineProperty(graph, "noname",
                    Object.getOwnPropertyDescriptor(graph, ""));
                delete graph[""];
            }
        }
        return graph
    }


    function showAte() {
        if(isAteCalculated) {
            return (
                <>
                    <p>Причинно-следственный вывод (Estimate ATE): {estimateAte}</p>
                </>
            )
        } else {
            return (
                <></>
            )
        }

    }

    function showCausalGraph() {
        return (
            <>
                <Graph
                    className={"graph"}
                    graph={prepareGraph(graph)}
                />
                <InputField
                    className={"field_file"}
                    type={"file"}
                    title={"Загрузите файл таблицы:"}
                    handler={
                        fileCsv => {
                            getFileReaderCsv(fileCsv)
                        }
                    }
                />
                <MakeCausalGraphButton
                    csv={csv}
                    handler={
                        (receivedGraph) => {
                            setChangeState(!changeState)
                            setGraph(receivedGraph)
                        }
                    }
                />
            </>
        )
    }

    function showCausalInference() {
        if(graph && Object.keys(graph).length > 0) {
            return (
                <>
                    <InputFieldInferenceValue
                        title={"TargetVariable:"}
                        csv={csv}
                        isMany={false}
                        variables={targetVariables}
                        properties={targetVariablesProperties}
                        handler={(variables) => {
                            setChangeState(!changeState)
                            setTargetVariables(variables)
                        }}
                        object={{TargetVariableName: variables[0], Algorithm: "MLP Regression"}}
                    />

                    <InputFieldInferenceValue
                        title={"TreatmentVariables:"}
                        csv={csv}
                        isMany={true}
                        variables={treatmentVariables}
                        properties={treatmentVariablesProperties}
                        handler={(variables) => {
                            setChangeState(!changeState)
                            setTreatmentVariables(variables)
                        }}
                        object={{TreatmentVariableName: variables[0], TreatmentValue: 0, ControlValue: 0}}
                    />

                    <InputFieldInferenceValue
                        title={"ConditionVariables:"}
                        csv={csv}
                        isMany={true}
                        variables={conditionVariables}
                        properties={conditionVariablesProperties}
                        handler={(variables) => {
                            setChangeState(!changeState)
                            setConditionVariables(variables)
                        }}
                        object={{ConditionVariableName: variables[0], ConditionValue: 0}}
                    />
                    <MakeCausalInferenceButton
                        csv={csv}
                        handler={
                            (estimateAte) => {
                                setEstimateAte(estimateAte)
                                setIsAteCalculated(true)
                            }
                        }
                        graph={graph}
                        targetVariable={targetVariables[0].TargetVariableName}
                        algorithm={targetVariables[0].Algorithm}
                        treatmentVariables={treatmentVariables}
                    />
                    {showAte()}
                </>
            )
        }
        else {
            return (
                <></>
            )
        }
    }

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                {showCausalGraph()}
                {showCausalInference()}
            </header>
        </div>
    );

}

export default App;
