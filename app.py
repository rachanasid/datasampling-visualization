import pandas as pd
from scipy.cluster.vq import kmeans, vq
from collections import Counter
import random
from sklearn.preprocessing import StandardScaler
import numpy as np
from sklearn.decomposition import PCA
from sklearn import metrics
from sklearn.manifold import MDS
from flask import Flask,render_template

SAMPLE_SIZE = 500
LOADING = 3
PRIMARY_COMPONENTS = 2
path = 'static/data/'

PORT = 5000
app = Flask(__name__)


def get_data(file):
    df = pd.read_csv(file)

    del df['Unnamed: 0']
    df = df.replace('CH', 1)
    df = df.replace('MM', 0)
    df = df.replace('Yes', 1)
    df = df.replace('No', 0)
    return df


def random_sampling(df):
    samples = df.sample(n=SAMPLE_SIZE, replace=True)
    samples.to_csv(path+'random_sampling.csv', sep=',')
    return samples


def stratified_sampling(df):
    samples = df
    initial = [kmeans(samples, i) for i in range(1, 10)]
    data = np.array([distortion for (codebook,distortion) in initial])
    kmeans_data = pd.DataFrame(data.reshape(-1,1), columns=["Objective_function"])
    kmeans_data["K"] = xrange(1, 10)
    kmeans_data.to_csv(path + 'kmeans_data.csv', sep=',')

    codebook, distortion = initial[3]
    code, dist = vq(samples, codebook)
    length = len(code)
    counter = Counter(code)

    indices = []
    for mark in set(code):
      index = {k: v for k, v in enumerate(code) if v == mark}
      indices.extend(random.sample(index, counter[mark]*SAMPLE_SIZE/length))
    samples = df.ix[indices]
    samples.to_csv(path+'stratified_sampling.csv', sep=',')
    return samples


def get_intrinsic_dimension(samples, sampling):
    standardized_samples = StandardScaler().fit_transform(samples).T
    correlation_matrix = np.corrcoef(standardized_samples)
    eigen_values, eigen_vectors = np.linalg.eig(correlation_matrix)

    scree_plot_data = pd.DataFrame(eigen_values, columns=["Eigen_values"])
    scree_plot_data["PCA_Component"] = xrange(1,len(samples.columns)+1)
    scree_plot_data.to_csv(path+'scree_plot_data_' + sampling + '.csv', sep=',')
    
    intrinsic_dimension = (eigen_values >= 1).sum()
    return intrinsic_dimension


def get_squared_loadings(samples, dimension, sampling, loading_num):
    pca = PCA(n_components=dimension)
    pca.fit_transform(StandardScaler().fit_transform(samples))
    loadings = np.array(pca.components_).transpose()

    squared_loadings = np.sqrt(np.sum(np.square(loadings), axis=1))
    squared_loadings_data = pd.DataFrame(squared_loadings, columns=["Squared_loadings"])
    squared_loadings_data["Attributes"] = pd.DataFrame(samples).columns
    squared_loadings_data = squared_loadings_data.sort_values(["Squared_loadings"], ascending=[False])
    squared_loadings_data.to_csv(path+'squared_loadings_data_' + sampling + '.csv', sep=',')

    max_loading = squared_loadings_data[0:loading_num]['Attributes'].values.tolist()
    samples.ix[:, max_loading].to_csv(path+'dim_red_data_' + sampling + '.csv', sep=',')
    return max_loading


def calculate_pca(samples, sampling, dimension):
    samples = StandardScaler().fit_transform(samples)
    pca_data = pd.DataFrame(PCA(n_components=dimension).fit_transform(samples))
    pca_data.columns = ["pca1", "pca2"]
    pca_data.to_csv(path+'pca_dim_data_' + sampling + '.csv', sep=',')
    return pca_data


def calculate_mds(samples, sampling, metric_type):
    samples = StandardScaler().fit_transform(samples)
    dist = metrics.pairwise_distances(samples, metric=metric_type)
    mds = MDS(n_components=2, dissimilarity='precomputed')

    mds_data = pd.DataFrame(mds.fit_transform(dist))
    mds_data.columns = ["mds1", "mds2"]
    mds_data.to_csv(path+'mds_dim_data_' + metric_type + '_' + sampling + '.csv', sep=',')
    return mds_data

@app.route("/")
def index():
    return render_template('index.html')


def run():
    file = 'OJ.csv'
    df = get_data(file)

    random_samples = random_sampling(df)
    stratified_samples = stratified_sampling(df)

    intrinsic_dimension_random = get_intrinsic_dimension(random_samples, "random")
    intrinsic_dimension_stratified = get_intrinsic_dimension(stratified_samples, "stratified")

    squared_loadings_r = get_squared_loadings(random_samples, intrinsic_dimension_random, "random", LOADING)
    squared_loadings_s = get_squared_loadings(stratified_samples, intrinsic_dimension_stratified, "stratified", LOADING)

    pca_r = calculate_pca(random_samples, "random", PRIMARY_COMPONENTS)
    pca_s = calculate_pca(stratified_samples, "stratified", PRIMARY_COMPONENTS)

    mds_metric = ["correlation", "euclidean"]
    for metric in mds_metric:
      mds_r = calculate_mds(random_samples, "random", metric)
      mds_s = calculate_mds(stratified_samples, "stratified", metric)


if __name__ == "__main__":
    # run()
    app.run(host='0.0.0.0', port=PORT, debug=True)
    print "serving at port", PORT