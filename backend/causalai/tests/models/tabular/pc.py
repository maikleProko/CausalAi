import unittest
import numpy as np
import math
import pickle as pkl
try:
    import ray
except:
    pass

from causalai.models.common.prior_knowledge import PriorKnowledge
from causalai.data.tabular import TabularData
from causalai.data.transforms.tabular import StandardizeTransform
from causalai.models.tabular.pc import PCSingle, PC

class TestPCTabularModel(unittest.TestCase):
    def test_pc_tabular_model(self):
        with open('causalai/tests/datasets/tabular/synthetic_data1.pkl', 'rb') as f:
            dataset = pkl.load(f)
        graph_gt, data_array = dataset['graph'], dataset['data']
        var_names = list(graph_gt.keys())

        data_train = data_array

        StandardizeTransform_ = StandardizeTransform()
        StandardizeTransform_.fit(data_train)

        data_train_trans = StandardizeTransform_.transform(data_train)

        data_train_obj = TabularData(data_train_trans, var_names=var_names)
        prior_knowledge = PriorKnowledge(forbidden_links={'a': ['b']}) # b cannot be a parent of a


        # check the outputs of Full Causal Discovery methods
        prior_knowledge = None

        pc = PC(
                data=data_train_obj,
                prior_knowledge=prior_knowledge,
                use_multiprocessing=False
                )

        results = pc.run(pvalue_thres=0.05)
        graph_gt = {'a': {'parents': [], 'value_dict': {}, 'pvalue_dict': {}},\
                    'b': {'parents': ['a'], 'value_dict': {'a': 0.0707860143755767},\
                    'pvalue_dict': {'a': 5.446967467574617e-07}}, 'c': {'parents': ['b'],\
                    'value_dict': {'b': 0.1307370257845878}, 'pvalue_dict': {'b': 1.676960962472498e-20}},\
                    'd': {'parents': ['g'], 'value_dict': {'g': 0.1089284982478336},\
                    'pvalue_dict': {'g': 1.1389090834247264e-14}}, 'e': {'parents': [],\
                    'value_dict': {}, 'pvalue_dict': {}}, 'f': {'parents': ['c', 'e'],\
                    'value_dict': {'c': 0.09700857068785299, 'e': 0.09979997815122245},\
                    'pvalue_dict': {'c': 6.301196424981861e-12, 'e': 1.5258971558298902e-12}},\
                    'g': {'parents': [], 'value_dict': {}, 'pvalue_dict': {}}}

        for key in graph_gt.keys():
            self.assertTrue(results[key]==graph_gt[key])


# if __name__ == "__main__":
#     unittest.main()
