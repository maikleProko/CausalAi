import React, {useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import PropTypes from "prop-types";
import cytoscape from 'cytoscape';
import cola from "cytoscape-cola";


const elements = [
    { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
    { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
    { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } }
];

const stylesheet = [
        {
            selector: "node",
            style: {
                'height': 20,
                'width': 20,
                'backgroundColor': '#014486',
                'opacity': 1,
                'label': 'data(name)'
            }
        },
        {
            selector: "edge",
            style: {
                'curve-style': 'bezier',
                'haystack-radius': 1,
                'width': 5,
                'line-color': '#1AB9FF',
                'opacity': 1,
                'target-arrow-shape': 'triangle',
                'target-arrow-color': '#1AB9FF '


            }
        }
    ]


let cyStyle = {
    height: '450px',
    width: '1300px',
    margin: '20px 0px',
    position: "center"
};



export default function Graph(props) {

    function getElements() {
        let nodesArray = []
        let edgeArray = []
        let nodes = []
        let edges = []

        for(const arr in props.graph){
            nodesArray.push(arr)
            for(const dataArr in props.graph[arr]){
                edgeArray.push(arr + ' ' + props.graph[arr][dataArr])
            }
        }
        for(const node in nodesArray){
            nodes.push({data: {id:  String(nodesArray[node]), name: nodesArray[node]}})
        }
        for(const edge in edgeArray){
            edges.push({data: {id:edgeArray[edge], source:edgeArray[edge].split(' ')[1], target: edgeArray[edge].split(' ')[0], value: 1}})
        }

        return {
            nodes: nodes,
            edges: edges
        }

    }


    function renderCytoscapeElement() {

        cytoscape.use(cola)

        let cy = cytoscape(
            {
                container: document.getElementById('cy'),

                boxSelectionEnabled: false,
                autounselectify: true,
                zoomingEnabled:false,
                headless:false,

                style: cytoscape.stylesheet()
                    .selector('node')
                    .css({
                        'height': 20,
                        'width': 20,
                        'backgroundColor': '#014486',
                        'color': 'white',
                        'opacity': 1,
                        'label': 'data(name)'
                    })
                    .selector('edge')
                    .css({
                        'color': 'white',
                        'curve-style': 'bezier',
                        'haystack-radius': 1,
                        'width': 5,
                        'line-color': '#1AB9FF',
                        'opacity': 1,
                        'target-arrow-shape': 'triangle',
                        'target-arrow-color': '#1AB9FF '
                    })
                ,
                elements: getElements(),

                layout: {
                    name: 'breadthfirst',
                    directed: true,
                    padding: 10
                }
            });

        cy.layout({
            name: 'cola',
            randomize:true,
        }).run()
    }

    useEffect( () => {

        if(Object.keys(props.graph).length > 0) {
            renderCytoscapeElement()
        }

    })


    if(Object.keys(props.graph).length > 0) {
        return (
            <>
                <div id = 'cy' style={cyStyle}/>
            </>
        )
    } else {
        return (
            <></>
        )
    }


    Graph.propTypes = {
        graph: PropTypes.any
    }
}
