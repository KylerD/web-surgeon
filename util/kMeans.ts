import { kmeans } from "ml-kmeans";

export function performKMeans(embeddings: number[][], nClusters: number) {
  // Perform clustering
  const result = kmeans(embeddings, nClusters, {
    initialization: 'kmeans++',
    seed: 42,
  });

  // Get the cluster labels
  const clusterLabels = result.clusters;
  return clusterLabels;
}