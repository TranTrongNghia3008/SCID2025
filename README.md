
# SOICT 2024

# Title
GeoSI: An Interesting Interactive System for Retrieving and Mapping News from Multiple Online Sources

# Authors
| No. | Author                        | Email |
|-----|-------------------------------|-------|
| 1   | Minh-Nhat Nguyen<sup>*</sup>           | 21120107@student.hcmus.edu.vn |
| 2   | Trong-Nghia Tran<sup>*</sup> | 21120507@student.hcmus.edu.vn |
| 3   | Minh-Triet Tran<sup>**</sup>  | tmtriet@fit.hcmus.edu.vn |

*<sup>*</sup>*  Both authors contribute equally.
*<sup>**</sup>*  Corresponding author


# Description
This source code implements GeoSI, submitted to SOICT 2024. It is a question-answering system that utilizes the latest online data and organizes information on a map to analyze trends specific to different regions.

# Workflow
<center>
  <img
    src="OverviewArchitecture.png"
  >
  <figcaption>Overall Workflow</figcaption>
</center>

# Testing pipeline

Please refer to this [Colab link](https://colab.research.google.com/drive/15RsJgG7nXEvnN5-ERo7MhZtJWrqoCxQO?usp=sharing) to run a test of the system's pipeline.

# Compare the results of the Q&A responses
- **Question 1:** Give me the current climate change situation on vnexpress website
	<div style="overflow-x: auto; white-space: nowrap;"> <div style="display: inline-block; width: 250px; text-align: center;"> <strong>Gemini:</strong><br> <img src="results/Gemini1.png" alt="Response of Gemini" title="Response of Gemini" style="width: 90%;"/> </div> <div style="display: inline-block; width: 250px; text-align: center;"> <strong>BingAI:</strong><br> <img src="results/Bing1.png" alt="Response of BingAI" title="Response of BingAI" style="width: 90%;"/> </div> <div style="display: inline-block; width: 250px; text-align: center;"> <strong>ChatGPT:</strong><br> <img src="results/ChatGPT1.png" alt="Response of ChatGPT" title="Response of ChatGPT" style="width: 90%;"/> </div> <div style="display: inline-block; width: 250px; text-align: center;"> <strong>GeoSI:</strong><br> <img src="results/GeoSI1.png" alt="Response of GeoSI" title="Response of GeoSI" style="width: 90%;"/> </div> </div>
		
- **Question 2:** Severe flooding and emergencies due to Typhoon Yagi.
	<div style="overflow-x: auto; white-space: nowrap;"> <div style="display: inline-block; width: 250px; text-align: center;"> <strong>Gemini:</strong><br> <img src="results/Gemini2.png" alt="Response of Gemini" title="Response of Gemini" style="width: 90%;"/> </div> <div style="display: inline-block; width: 250px; text-align: center;"> <strong>BingAI:</strong><br> <img src="results/Bing2.png" alt="Response of BingAI" title="Response of BingAI" style="width: 90%;"/> </div> <div style="display: inline-block; width: 250px; text-align: center;"> <strong>ChatGPT:</strong><br> <img src="results/ChatGPT2.png" alt="Response of ChatGPT" title="Response of ChatGPT" style="width: 90%;"/> </div> <div style="display: inline-block; width: 250px; text-align: center;"> <strong>GeoSI:</strong><br> <img src="results/GeoSI2.png" alt="Response of GeoSI" title="Response of GeoSI" style="width: 90%;"/> </div> </div>
