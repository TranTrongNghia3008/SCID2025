
# SCID 2025

# Title
Enhancing Medical Chatbot Reliability: A Multi-Step Verification Approach to Prevent Hallucinations

# Authors
| No. | Author                        | Email |
|-----|-------------------------------|-------|
| 1   | Trong-Nghia Tran<sup>*</sup> | 21120507@student.hcmus.edu.vn |
| 2   | Minh-Nhat Nguyen<sup>*</sup>           | 21120107@student.hcmus.edu.vn |
| 3   | Trong-Le Do  | dtle@selab.hcmus.edu.vn |
| 4   | Minh-Triet Tran<sup>**</sup>  | tmtriet@fit.hcmus.edu.vn |

*<sup>*</sup>*  Both authors contribute equally.
*<sup>**</sup>*  Corresponding author


## Introduction
Medical chatbots powered by large language models (LLMs) have shown significant potential in providing healthcare-related information. However, ensuring the reliability of chatbot-generated responses is crucial to preventing misinformation and hallucinated outputs.

This project introduces a **multi-step verification framework** to enhance chatbot reliability by integrating fact-checking mechanisms. The system is designed to retrieve medical information dynamically, verify accuracy using authoritative sources like WHO, and refine responses to ensure credibility.

# Workflow
<center>
  <img
    src="pipeline.png"
  >
  <figcaption>Overall Workflow</figcaption>
</center>

# Features
- **Real-time Information Retrieval**: Uses Selenium and Bing Search to fetch the latest medical articles.
- **Fact-Checking Mechanism**: Verifies chatbot responses by cross-referencing with WHO data and Medical-NER models.
- **Multi-Step Verification**:
  1. Crawling medical data and generating answers.
  2. Splitting sentences for precise verification.
  3. Fact-checking and correcting hallucinated responses.
  4. Refining the final output to ensure clarity and coherence.
- **Visualization & User Interaction**: Provides interactive features for users to explore real-time medical data on a world map.
- **Benchmark Testing**: Evaluated on the **COVID-Fact dataset**, achieving **79.5% accuracy** in fact verification.

# Testing pipeline

Please refer to this [Colab link](https://colab.research.google.com/drive/1cTo0MSzdxN8lEtw3LtMIdgcPN2vrfsMz?usp=sharing) to run a test of the system's pipeline.

## Example Query & Response

**User Query:** "Effective treatments for cancer on MedlinePlus"

**AI-generated Answer:** 
> "...treating melanoma at early stages to prevent progression to more advanced, incurable stages. Current approaches are **focused on optimizing drug combinations** to enhance efficacy while minimizing toxicity..."

**Refined Response:** 
> "...treating melanoma at early stages to prevent progression to more advanced stages. **For Stage 0 melanoma (melanoma in situ), the primary treatment is surgical excision, where the melanoma and a small margin of normal skin are removed**..."

**Sources:** [Treatment of Melanoma Skin Cancer, by Stage](https://www.cancer.org/cancer/types/melanoma-skin-cancer/treating/by-stage.html)

<center>
<img
    src="app_screen.png"
>
</center>

# Evaluation

The chatbot has been tested using the COVID-Fact dataset, comparing its performance against baseline models. Results indicate a 79.5% accuracy in filtering out misinformation.

# Citation

If you use this work in your research, please cite:
```
@inproceedings{Tran2025SCID,
  author = {Trong-Nghia Tran, Minh-Nhat Nguyen, Trong-Le Do, Minh-Triet Tran},
  title = {Enhancing Medical Chatbot Reliability: A Multi-Step Verification Approach to Prevent Hallucinations},
  booktitle = {SCID 2025},
  year = {2025},
}
```
