<a href="https://www.sannywamik.com">
  <img src="assets/banner.svg" alt="Sanny Un Sowadh Wamik, data scientist. Portfolio at sannywamik.com" width="100%">
</a>

<p align="center">
  <a href="https://www.sannywamik.com"><img alt="Live site: sannywamik.com" src="https://img.shields.io/badge/LIVE-sannywamik.com-d1342a?style=for-the-badge&labelColor=1c1c22"></a>
  <img alt="Status: open to roles" src="https://img.shields.io/badge/STATUS-open%20to%20roles-3fae6a?style=for-the-badge&labelColor=1c1c22">
  <img alt="Studying B. Data Science at RMIT, graduating 2027" src="https://img.shields.io/badge/RMIT-B.%20Data%20Science%20'27-f5c518?style=for-the-badge&labelColor=1c1c22">
</p>

<p align="center">
  <a href="#featured-work">Work</a> &nbsp;·&nbsp;
  <a href="#stack">Stack</a> &nbsp;·&nbsp;
  <a href="#the-portfolio-site">The site</a> &nbsp;·&nbsp;
  <a href="#contact">Contact</a>
</p>

## About

Final-year Data Science student at **RMIT University** (graduating 2027). I build machine-learning models, and the pipelines and APIs that carry them into production. Three of my projects run as live, documented services with MLflow tracking and CI/CD.

I'm just as comfortable in SQL and Power BI or Tableau, turning large, messy datasets into decisions people can act on.

| Quick facts | |
|---|---|
| **Studying** | B. Data Science, RMIT (expected 2027) |
| **Focus** | Machine learning, MLOps, data pipelines, analytics |
| **Status** | Open to data science roles |
| **Based in** | Melbourne, Australia |

## Featured work

<table>
  <tr>
    <th align="left">Project</th>
    <th align="left">What it does</th>
    <th align="left">Result</th>
    <th align="left">Links</th>
  </tr>
  <tr>
    <td><b>Stock-price forecasting</b><br><sub>Python · XGBoost · LSTM · MLflow · FastAPI</sub></td>
    <td>Predicts next-day ASX direction using RSI, MACD and Bollinger features, validated with leakage-free walk-forward CV across 10 equities (18,460 samples). Served behind a FastAPI <code>/predict</code> endpoint and Streamlit, with an MLflow registry, pytest and GitHub Actions CI.</td>
    <td><b>51.8%</b> directional accuracy<br><sub>vs 48.8% baseline</sub></td>
    <td><a href="https://sanny2005-asx-stock-forecaster.hf.space/">Live</a> · <a href="https://sanny2005-asx-forecaster-api.hf.space/docs">API</a> · <a href="https://github.com/Sanny-Un-Sowadh-Wamik/stock-forecasting-mlops">Code</a></td>
  </tr>
  <tr>
    <td><b>Real-time fraud detection</b><br><sub>Python · XGBoost · SMOTE · SHAP · FastAPI WebSocket</sub></td>
    <td>Scores 284,807 credit-card transactions (0.17% fraud) with a cost-sensitive XGBoost and Isolation Forest ensemble and train-only SMOTE. SHAP reason codes stream live over a WebSocket into Alert, Review and OK.</td>
    <td><b>85.9%</b> of fraud caught at <b>84.7%</b> precision<br><sub>PR-AUC 0.88 · ROC-AUC 0.99</sub></td>
    <td><a href="https://sanny2005-realtime-fraud-detection.hf.space/">Live</a> · <a href="https://sanny2005-fraud-detection-api.hf.space/docs">API</a> · <a href="https://github.com/Sanny-Un-Sowadh-Wamik/realtime-fraud-detection">Code</a></td>
  </tr>
  <tr>
    <td><b>Melbourne suburb liveability index</b><br><sub>Python · GeoPandas · PCA · Folium · Streamlit</sub></td>
    <td>Ranks 260 Greater Melbourne suburbs on an 8-dimension liveability score, using real suburb-boundary geometry. PCA sets the weights instead of hand-picking them. Ships as an interactive choropleth that re-scores as you move the sliders.</td>
    <td><b>260</b> suburbs<br><sub>PC1 explains 42% of variance</sub></td>
    <td><a href="https://sanny2005-melbourne-liveability.hf.space/">Live</a> · <a href="https://github.com/Sanny-Un-Sowadh-Wamik/melbourne-liveability">Code</a></td>
  </tr>
  <tr>
    <td><b>Vaultr, AI cashback engine</b><br><sub>Next.js 14 · TypeScript · Apify · Claude API</sub></td>
    <td>A <code>/api/cashback</code> service that pulls live offers from five vetted Australian networks, runs a Claude pass to drop untrusted sources, and ranks what is left by the user's own spending. Three fallback tiers keep the feed loading.</td>
    <td>Live offers, ranked per user</td>
    <td><a href="https://github.com/Sanny-Un-Sowadh-Wamik/thevaultr">Code</a></td>
  </tr>
</table>

<details>
<summary><b>More projects</b> (13)</summary>
<br>

| Project | About | Stack |
|---|---|---|
| [Click & Collect analysis](https://github.com/Sanny-Un-Sowadh-Wamik/Click-Collect-Product-Analyst-Case-Study) | Funnel analysis across 110M events and 5.3M users | Python, SQL |
| [RFM segmentation](https://github.com/Sanny-Un-Sowadh-Wamik/RFM-customer-segmentation-analysis) | K-Means customer segments | Python |
| [Uber ride analytics 2024](https://github.com/Sanny-Un-Sowadh-Wamik/Uber-Ride-Analytics-2024---Data-Science-Project) | Demand and surge-pricing analysis | Python, Jupyter |
| [Depression risk prediction](https://github.com/Sanny-Un-Sowadh-Wamik/Depression-Prediction-Project) | Logistic regression, random forest and XGBoost compared | Jupyter |
| [House prices prediction](https://github.com/Sanny-Un-Sowadh-Wamik/House-Prices-Prediction) | Regression modelling and feature selection | Jupyter |
| [Titanic survival](https://github.com/Sanny-Un-Sowadh-Wamik/Titanic---Machine-Learning-from-Disaster) | Kaggle classification challenge | Jupyter |
| [F1 race analysis](https://github.com/Sanny-Un-Sowadh-Wamik/f1_analysis) | Telemetry and strategy analysis | Python |
| [Netflix movies EDA](https://github.com/Sanny-Un-Sowadh-Wamik/Investigating-Netflix-Movies) | Exploratory data analysis | Jupyter |
| [Interpol global map](https://github.com/Sanny-Un-Sowadh-Wamik/The-Global-Hunt-Mapping-Interpol-s-Most-Wanted) | Geospatial mapping in R | R |
| [bizbleed](https://github.com/Sanny-Un-Sowadh-Wamik/bizbleed) | Full-stack web app | TypeScript |
| [Store.AI](https://github.com/Sanny-Un-Sowadh-Wamik/Store.AI) | AI-powered commerce app | TypeScript |
| [MusicBot](https://github.com/Sanny-Un-Sowadh-Wamik/MusicBot) | Discord music bot | Python |
| [Transit delay prediction](https://github.com/Sanny-Un-Sowadh-Wamik/Predicting-Public-Transport-Delays-Using-Weather-Events) | Predicting delays from weather events | Jupyter |

</details>

## Stack

| Area | Tools |
|---|---|
| **Languages** | `Python` `SQL` `R` |
| **Machine learning** | `XGBoost` `LightGBM` `LSTM` `Time-series` `SMOTE` `PCA` `A/B testing` |
| **MLOps and tooling** | `scikit-learn` `Optuna` `SHAP` `MLflow` `FastAPI` `Docker` `GitHub Actions` `WebSockets` |
| **Data** | `pandas` `NumPy` `Spark` `Hadoop` `PostgreSQL` `Supabase` `GeoPandas` `ETL/ELT` |
| **Visualisation** | `Power BI` `Tableau` `Streamlit` `Plotly` `Matplotlib` `Seaborn` |
| **Workflow** | `Git` `Jupyter` `Linux` `pytest` `n8n` |

## The portfolio site

[**sannywamik.com**](https://www.sannywamik.com) is built to be played with, not just read. A few things worth finding:

- **A Poké Ball scroll scrubber.** The ball under the nav is the page position: drag it to fly through the site, tap it for the next section, hold it to return to the top, and watch it catch the page at the bottom.
- **Stacking project cards** that pin and shrink as the next one slides over, and animations that replay when you scroll back up.
- **A filterable "All works" grid** and a **searchable Data Stack** where tools swell under your cursor.
- **An interactive Data Lab:** beat a fraud-detection model, break a regression, train a neural net live in the browser, and try to out-guess a noisy market. Collect every card in the Data Dex.
- **English and 日本語**, a full-screen mobile menu, keyboard support, and a Reduce Motion mode that turns the animation off.

Built with TanStack Start, React 19, Vite, Tailwind CSS and Vercel. The full source is in this repository.

## GitHub

<p align="center">
  <a href="https://github.com/Sanny-Un-Sowadh-Wamik">
    <img alt="GitHub contribution streak" src="https://streak-stats.demolab.com?user=Sanny-Un-Sowadh-Wamik&hide_border=false&border_radius=16&background=F1EFE9&border=1C1C22&stroke=1C1C22&ring=D1342A&fire=F5C518&currStreakNum=1C1C22&sideNums=1C1C22&currStreakLabel=D1342A&sideLabels=1C1C22&dates=55555D">
  </a>
</p>

## Contact

Open to data science roles and collaboration. The quickest way to reach me is email.

<p>
  <a href="mailto:sannyunsowadh01@gmail.com"><img alt="Email" src="https://img.shields.io/badge/EMAIL-sannyunsowadh01@gmail.com-d1342a?style=for-the-badge&logo=gmail&logoColor=white&labelColor=1c1c22"></a>
  <a href="https://www.linkedin.com/in/sanny-un-sowadh-wamik/"><img alt="LinkedIn" src="https://img.shields.io/badge/LINKEDIN-sanny--un--sowadh--wamik-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white&labelColor=1c1c22"></a>
  <a href="https://github.com/Sanny-Un-Sowadh-Wamik"><img alt="GitHub" src="https://img.shields.io/badge/GITHUB-Sanny--Un--Sowadh--Wamik-f1efe9?style=for-the-badge&logo=github&logoColor=white&labelColor=1c1c22"></a>
</p>

<p align="center"><sub>Let's build something with data.</sub></p>
