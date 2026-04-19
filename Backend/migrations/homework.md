
## Chapter 11: Residual Networks

### Problem 11.4
**Question:** Explain why the values in the two branches of the residual blocks in figure 11.6a in the book are uncorrelated. Show that the variance of the sum of uncorrelated variables is the sum of their individual variances.

**Answer:**

They are uncorrelated because the input to the main branch of the residual block is multiplied by the weight matrix, which is normally distributed with mean zero. This can equally multiply by a positive or negative number so they are uncorrelated.

The mean of a sum \(z = x + y\) of variables \(x\) and \(y\) is given by:

\[
\mathbb{E}[z] = \mathbb{E}[x] + \mathbb{E}[y] = \mu_x + \mu_y
\]

The variance of a sum \(z = x + y\) of variables \(x\) and \(y\) is given by:

\[
\begin{align}
\text{Var}[z] &= \mathbb{E}[(z - \mathbb{E}[z])^2] \\
&= \mathbb{E}[(x + y - \mu_x - \mu_y)^2] \\
&= \mathbb{E}[((x - \mu_x) + (y - \mu_y))^2] \\
&= \mathbb{E}[(x - \mu_x)^2] + \mathbb{E}[(y - \mu_y)^2] + 2\mathbb{E}[(x - \mu_x)(y - \mu_y)] \\
&= \text{Var}[x] + \text{Var}[y] + \text{Covar}[x, y]
\end{align}
\]

The covariance is zero if the variables are uncorrelated and so variance is the sum of the individual variances.

---

### Problem 11.6
**Question:** Consider a fully connected neural network with one input, one output, and ten hidden layers, each of which contains twenty hidden units. How many parameters does this network have? How many parameters will it have if we place a batch normalization operation between each linear transformation and ReLU?

**Answer:**

Without batch normalization:
- Input to first hidden layer: \(1 \times 20 = 20\) weights + 20 biases = 40 parameters
- Between hidden layers (9 transitions): \(20 \times 20 = 400\) weights + 20 biases = 420 parameters each
- Total for hidden layers: \(40 + 9 \times 420 = 40 + 3780 = 3820\) parameters
- Last hidden to output: \(20 \times 1 = 20\) weights + 1 bias = 21 parameters
- **Total: 3841 parameters**

With batch normalization:
- Each BN layer adds 2 parameters per hidden unit (scale γ and shift δ)
- 10 hidden layers × 20 units × 2 parameters = 400 additional parameters
- **Total: 3841 + 400 = 4241 parameters**

---

### Problem 11.11
**Question:** Consider training a network with fifty layers using gradient checkpointing. Assume that we store the pre-activations at every tenth hidden layer during the forward pass. Explain how to compute the derivatives in this situation.

**Answer:**

During the backward pass:
1. We have stored activations at layers 0, 10, 20, 30, 40, 50
2. When computing gradients for layers 41-50, use the stored activation at layer 40
3. When we need gradients for layers 31-40, recompute the forward pass from layer 30 to layer 40 using stored activation at layer 30
4. Continue this process: for layers 21-30, recompute from layer 20; for layers 11-20, recompute from layer 10, etc.

This trades computation time (recomputing forward passes) for memory (not storing all intermediate activations).

---

## Chapter 12: Transformers

### Problem 12.1
**Question:** Consider a self-attention mechanism that processes N inputs of length D to produce N outputs of the same size. How many weights and biases are used to compute the queries, keys, and values? Assume that all three quantities are also of length D. How many attention weights a[•, •] will there be? How many weights and biases would there be in a fully connected shallow network relating all DN inputs to all DN outputs?

**Answer:**

**For self-attention:**
- Queries: \(D \times D\) weights + \(D\) biases = \(D^2 + D\) parameters
- Keys: \(D \times D\) weights + \(D\) biases = \(D^2 + D\) parameters
- Values: \(D \times D\) weights + \(D\) biases = \(D^2 + D\) parameters
- **Total: \(3D^2 + 3D\) parameters**

**Attention weights:** There will be \(N \times N\) attention weights in the attention matrix.

**For fully connected network:**
- Weights: \(DN \times DN = D^2N^2\)
- Biases: \(DN\)
- **Total: \(D^2N^2 + DN\) parameters**

Self-attention is much more efficient as it scales as \(O(D^2)\) rather than \(O(D^2N^2)\).

---

### Problem 12.3
**Question:** Show that the self-attention mechanism (equation 12.8) is equivariant to a permutation \(\mathbf{X}\mathbf{P}\) of the data \(\mathbf{X}\), where \(\mathbf{P}\) is a permutation matrix. In other words, show that:

\[
\text{Sa}[\mathbf{X}\mathbf{P}] = \text{Sa}[\mathbf{X}]\mathbf{P}
\]

**Answer:**

\[
\begin{align}
\text{Sa}[\mathbf{X}\mathbf{P}] &= (\boldsymbol{\beta}_v\mathbf{1}^T + \boldsymbol{\Omega}_v\mathbf{X}\mathbf{P})\text{Softmax}[(\boldsymbol{\beta}_q\mathbf{1}^T + \boldsymbol{\Omega}_q\mathbf{X}\mathbf{P})^T(\boldsymbol{\beta}_k\mathbf{1}^T + \boldsymbol{\Omega}_k\mathbf{X}\mathbf{P})] \\
&= (\boldsymbol{\beta}_v\mathbf{1}^T\mathbf{P} + \boldsymbol{\Omega}_v\mathbf{X}\mathbf{P})\text{Softmax}[(\boldsymbol{\beta}_q\mathbf{1}^T\mathbf{P} + \boldsymbol{\Omega}_q\mathbf{X}\mathbf{P})^T(\boldsymbol{\beta}_k\mathbf{1}^T\mathbf{P} + \boldsymbol{\Omega}_k\mathbf{X}\mathbf{P})] \\
&= (\boldsymbol{\beta}_v\mathbf{1}^T + \boldsymbol{\Omega}_v\mathbf{X})\mathbf{P}\text{Softmax}[\mathbf{P}^T(\boldsymbol{\beta}_q\mathbf{1}^T + \boldsymbol{\Omega}_q\mathbf{X})^T(\boldsymbol{\beta}_k\mathbf{1}^T + \boldsymbol{\Omega}_k\mathbf{X})\mathbf{P}] \\
&= (\boldsymbol{\beta}_v\mathbf{1}^T + \boldsymbol{\Omega}_v\mathbf{X})\mathbf{P}\mathbf{P}^T\text{Softmax}[(\boldsymbol{\beta}_q\mathbf{1}^T + \boldsymbol{\Omega}_q\mathbf{X})^T(\boldsymbol{\beta}_k\mathbf{1}^T + \boldsymbol{\Omega}_k\mathbf{X})]\mathbf{P} \\
&= (\boldsymbol{\beta}_v\mathbf{1}^T + \boldsymbol{\Omega}_v\mathbf{X})\text{Softmax}[(\boldsymbol{\beta}_q\mathbf{1}^T + \boldsymbol{\Omega}_q\mathbf{X})^T(\boldsymbol{\beta}_k\mathbf{1}^T + \boldsymbol{\Omega}_k\mathbf{X})]\mathbf{P} \\
&= \text{Sa}[\mathbf{X}]\mathbf{P}
\end{align}
\]

---

### Problem 12.10
**Question:** Attention weights are usually computed as:

\[
a[\mathbf{x}_m, \mathbf{x}_n] = \text{softmax}_m[\mathbf{k}_m^T\mathbf{q}_n] = \frac{\exp[\mathbf{k}_m^T\mathbf{q}_n]}{\sum_{m'=1}^N \exp[\mathbf{k}_{m'}^T\mathbf{q}_n]}
\]

Consider replacing \(\exp[\mathbf{k}_m^T\mathbf{q}_n]\) with the dot product \(g[\mathbf{k}_m]^T g[\mathbf{q}_n]\) where \(g[\bullet]\) is a nonlinear transformation. Show how this makes the computation of the attention weights more efficient.

**Answer:**

\[
a[\mathbf{x}_m, \mathbf{x}_n] = \frac{g[\mathbf{k}_m]^T g[\mathbf{q}_n]}{\sum_{m'=1}^N g[\mathbf{k}_{m'}]^T g[\mathbf{q}_n]} = \frac{g[\mathbf{k}_m]^T g[\mathbf{q}_n]}{(\sum_{m'=1}^N g[\mathbf{k}_{m'}]^T) g[\mathbf{q}_n]}
\]

Using this formulation, we can compute the summation before the dot product. When we increase N (i.e., we add an extra token during decoding), the original computation of an attention value is \(O[ND]\) (we sum N terms, each of order D). However, in the modified version, we need only to add an extra dot product in the denominator, which costs \(O[D']\) where \(D'\) is the dimension of the transformed vector \(g[\bullet]\).

See equations 12-14 of [this blog](https://arxiv.org/abs/2006.16236) for more details.

---

## Chapter 13: Graph Neural Networks

### Problem 13.2
**Question:** Draw graphs that correspond to the following adjacency matrices:

\[
\mathbf{A}_1 = \begin{bmatrix}
0 & 1 & 1 & 0 & 0 & 0 & 0\\
1 & 0 & 0 & 1 & 1 & 1 & 0\\
1 & 0 & 0 & 0 & 0 & 1 & 1\\
0 & 1 & 0 & 0 & 0 & 1 & 1\\
0 & 1 & 0 & 0 & 0 & 0 & 1\\
0 & 1 & 1 & 1 & 0 & 0 & 0\\
0 & 0 & 1 & 1 & 1 & 0 & 0
\end{bmatrix}
\quad
\mathbf{A}_2 = \begin{bmatrix}
0 & 0 & 1 & 1 & 0 & 0 & 1\\
0 & 0 & 1 & 1 & 1 & 0 & 0\\
1 & 1 & 0 & 0 & 0 & 0 & 0\\
1 & 1 & 0 & 0 & 1 & 1 & 1\\
0 & 1 & 0 & 1 & 0 & 0 & 1\\
0 & 0 & 0 & 1 & 0 & 0 & 1\\
1 & 0 & 0 & 1 & 1 & 1 & 0
\end{bmatrix}
\]

**Answer:**

See figure 13.1 in the answer booklet (page 49) for the graph visualizations.

---

### Problem 13.3
**Question:** Consider the two graphs in figure 13.2. How many ways are there to walk from node one to node two in (i) three steps and (ii) seven steps?

**Answer:**

To calculate, multiply adjacency matrix by itself K times.

For the first graph:
- (i) Three steps: **9 ways**
- (ii) Seven steps: **879 ways**

For the second graph:
- (i) Three steps: **3 ways**
- (ii) Seven steps: **203 ways**

---

### Problem 13.7
**Question:** Consider the simple GNN layer:

\[
\mathbf{H}_{k+1} = \text{GraphLayer}[\mathbf{H}_k, \mathbf{A}] = a\left[\boldsymbol{\beta}_k\mathbf{1}^T + \boldsymbol{\Omega}_k\begin{bmatrix}\mathbf{H}_k \\ \mathbf{H}_k\mathbf{A}\end{bmatrix}\right]
\]

Show that this layer is equivariant to permutations of the node order so that:

\[
\text{GraphLayer}[\mathbf{H}_k, \mathbf{A}]\mathbf{P} = \text{GraphLayer}[\mathbf{H}_k\mathbf{P}, \mathbf{P}^T\mathbf{A}\mathbf{P}]
\]

**Answer:**

\[
\begin{align}
\text{GraphLayer}[\mathbf{H}_k\mathbf{P}, \mathbf{P}^T\mathbf{A}\mathbf{P}] &= a\left[\boldsymbol{\beta}_k\mathbf{1}^T + \boldsymbol{\Omega}_k\begin{bmatrix}\mathbf{H}_k\mathbf{P} \\ \mathbf{H}_k\mathbf{P}\mathbf{P}^T\mathbf{A}\mathbf{P}\end{bmatrix}\right] \\
&= a\left[\boldsymbol{\beta}_k\mathbf{1}^T + \boldsymbol{\Omega}_k\begin{bmatrix}\mathbf{H}_k\mathbf{P} \\ \mathbf{H}_k\mathbf{A}\mathbf{P}\end{bmatrix}\right] \\
&= a\left[\boldsymbol{\beta}_k\mathbf{1}^T\mathbf{P} + \boldsymbol{\Omega}_k\begin{bmatrix}\mathbf{H}_k\mathbf{P} \\ \mathbf{H}_k\mathbf{A}\mathbf{P}\end{bmatrix}\right] \\
&= a\left[\boldsymbol{\beta}_k\mathbf{1}^T + \boldsymbol{\Omega}_k\begin{bmatrix}\mathbf{H}_k \\ \mathbf{H}_k\mathbf{A}\end{bmatrix}\right]\mathbf{P} \\
&= \text{GraphLayer}[\mathbf{H}_k, \mathbf{A}]\mathbf{P}
\end{align}
\]

---

### Problem 13.11
**Question:** Draw the edge graph associated with the graph in figure 13.15a in the book.

**Answer:**

See figure 13.4a in the answer booklet (page 51) for the edge graph visualization.

---

### Problem 13.14
**Question:** Design a layer that updates a node embedding \(\mathbf{h}_n\) based on its neighboring node embeddings \(\{\mathbf{h}_m\}_{m \in \text{ne}[n]}\) and neighboring edge embeddings \(\{\mathbf{e}_m\}_{m \in \text{nee}[n]}\). You should consider the possibility that the edge embeddings are not the same size as the node embeddings.

**Answer:**

\[
\mathbf{H}_{k+1} = a\left[\boldsymbol{\beta}_k\mathbf{1}^T + \boldsymbol{\Omega}_k\mathbf{H}_k(\mathbf{A} + \mathbf{I}) + \boldsymbol{\Phi}_k\mathbf{E}_k\mathbf{N}\right]
\]

where:
- \(\boldsymbol{\Phi} \in \mathbb{R}^{|N| \times |E|}\) contains parameters for the edges
- \(\mathbf{E}\) contains the edge embeddings
- \(\mathbf{N}\) is a matrix that contains the indices of the edges that connect to node \(k\) in its \(k^{\text{th}}\) column

---

## Chapter 15: Generative Adversarial Networks

### Problem 15.2
**Question:** Write an equation relating the loss L in equation 15.8 to the Jensen-Shannon distance \(D_{JS}[Pr(x^*) || Pr(x)]\) in equation 15.9.

**Answer:**

\[
D_{JS}[Pr(x^*) || Pr(x)] = -\frac{1}{2}L + \log[2]
\]

---

### Problem 15.4
**Question:** Calculate (i) the KL divergence, (ii) the reverse KL divergence, (iii) the Jensen-Shannon divergence, and (iv) the Wasserstein distance between the distributions:

\[
Pr(z) = \begin{cases}
0 & z < 0 \\
1 & 0 \leq z \leq 1 \\
0 & z > 1
\end{cases}
\]

and

\[
Pr(z) = \begin{cases}
0 & z < a \\
1 & a \leq z \leq a+1 \\
0 & z > a
\end{cases}
\]

for the range \(a \in [-3, 3]\).

**Answer:**

- **KL divergence:** Zero when \(a = 0\) and infinite otherwise
- **Reverse KL divergence:** Zero when \(a = 0\) and infinite otherwise
- **Jensen-Shannon divergence:** \(\log 2\) when \(a \leq -1\) or \(a \geq 1\), and takes the value \(|a| \log[2]\) otherwise
- **Wasserstein distance:** \(|a|\)

To get a formula for the Wasserstein distance for this special case, consider the total "earth" (i.e., probability mass) that must be moved and multiply this by the distance it must move.

---