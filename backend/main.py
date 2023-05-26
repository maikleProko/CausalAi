from causalai.models.tabular.pc import PC as PC_tabular
from causalai.models.common.CI_tests.partial_correlation import PartialCorrelation
from causalai.models.tabular.causal_inference import CausalInference
from causalai.data.tabular import TabularData
from causalai.data.transforms.time_series import StandardizeTransform
from causalai.models.common.prior_knowledge import PriorKnowledge
from causalai.misc.misc import get_precision_recall
from sklearn.neural_network import MLPRegressor
import math
import numpy
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask('')
CORS(app)

def get_prior(prior):
    return prior.get('existing_links', {}), prior.get('forbidden_links', {}), prior.get('root_nodes', []), prior.get('leaf_nodes', [])

def get_data_transform(elements, is_discrete):
    standardize_transform = StandardizeTransform()
    standardize_transform.fit(elements)
    if not is_discrete:
        return numpy.array(standardize_transform.transform(elements))
    else:
        return numpy.array(elements)

def get_data_converted(data_transform, variables):
    return TabularData(data_transform, var_names=variables)

def get_discovery_tabular(algorithm, ci_test, data_obj, prior, pvalue_thres):
    if algorithm=='PC':
        ci_test_converted = PartialCorrelation()
        model = PC_tabular(data=data_obj, prior_knowledge=prior, CI_test=ci_test_converted, use_multiprocessing=True)
        return model.run(pvalue_thres=pvalue_thres, max_condition_set_size=4), model
    else:
        raise ValueError(f'')

def get_discovery(algorithm, ci_test, data_obj, prior, pvalue_thres):
    result, model = get_discovery_tabular(algorithm, ci_test, data_obj, prior, pvalue_thres)
    return result, model

def get_graph_discovery_tabular(graph_estimate, graph_estimate_undirected, result, algorithm, model):
    for key in result.keys():
        parents = result[key]['parents']
        graph_estimate[key].extend(parents)
        if algorithm=='PC':
            graph_estimate_undirected = model.skeleton
    return graph_estimate, graph_estimate_undirected

def get_graph_discovery(result, algorithm, model):
    graph_estimate={n:[] for n in result.keys()}
    graph_estimate_undirected = {n:[] for n in result.keys()}
    graph_estimate, graph_estimate_undirected = get_graph_discovery_tabular(graph_estimate, graph_estimate_undirected,
                                                                  result, algorithm, model)
    return graph_estimate, graph_estimate_undirected

def get_prior_converted(prior):
    existings, forbiddens, roots, leafs = get_prior(prior)
    return PriorKnowledge(forbidden_links=forbiddens, existing_links=existings, root_variables=roots, leaf_variables=leafs)


def form_precision_recall(graph_estimate, data):
    if len(data["graph"]) != 0 :
        return get_precision_recall(graph_estimate, data["graph"])
    else:
        return [None]*3

@app.route("/get_causal_graph", methods=["POST"])
def get_causal_graph():
    data = request.get_json()
    prior = get_prior_converted(data["prior"])
    data_transform = get_data_transform(data["elements"], True)
    data_converted = get_data_converted(data_transform, data["variables"])
    result, model = get_discovery(data["algorithm"], data["ci_test"], data_converted, prior, data["pvalue"])
    graph_estimate, graph_estimate_undirected = get_graph_discovery(result, data["algorithm"], model)
    precision, recall, f1_score = form_precision_recall(graph_estimate, data)
    return jsonify({'graph_est':graph_estimate,
                    'graph_est_undirected':graph_estimate_undirected,
                    'precision':precision,
                    'recall':recall,
                    'f1_score':f1_score})

def get_treatment_variables_converted(name, t,c):
    return dict(var_name=name, treatment_value=t, control_value=c)

def get_treatment_variable_converted(treatment_variables):
    treatment_variable_converted = []
    for treatment_variable in treatment_variables:
        treatment_variable_converted.append(get_treatment_variables_converted(
            treatment_variable["TreatmentVariableName"],
            float(treatment_variable["TreatmentValue"]),
            float(treatment_variable["ControlValue"])))
    return treatment_variable_converted

def get_causal_inference(graph, elements, variables, prediction_model, is_discrete):
    return CausalInference(numpy.array(elements), variables, graph, prediction_model, discrete=is_discrete)

def get_limit(value):
    if((value) != None and math.isnan(value)):
        return 'NaN'
    if(value is None):
        return '-'
    return value

@app.route("/get_causal_inference_ate", methods=["POST"])
def get_causal_inference_ate():
    data = request.get_json()
    prediction_model = MLPRegressor
    treatment_variable_converted = get_treatment_variable_converted(data["treatment_variables"])
    result = get_causal_inference(data["graph"], data["elements"], data["variables"],
                                  prediction_model, True)
    estimate_ate = get_limit(result.ate(data["target_variable"], treatment_variable_converted)[0])
    return jsonify({'estimate_ate':estimate_ate})