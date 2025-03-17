from pythonBE.config import *

def correct_answer(original_answer, correct_info, incorrect_info, revised_info):
  prompt = f"""
  You are tasked with revising an answer. Here is the information provided:

  1. Original Answer: {original_answer}

  2. Correct Information:
  {correct_info}

  3. Incorrect Information:
  {incorrect_info}

  4. Revised Information for Incorrect Information:
  {revised_info}

  Your task:
  - Remove all incorrect information from the original answer.
  - Replace incorrect information with the correct revised information.
  - Ensure the final answer remains coherent, clear, and accurate.

  Provide the revised answer below:
  """
  print(prompt)
  completion = client.chat.completions.create(
      model="gpt-4o-mini",
      messages=[
            {"role": "system", "content": "You are a helpful assistant for correcting text."},
            {"role": "user", "content": prompt},
        ]
  )

  return completion.choices[0].message.content