# Fine-Tuning

In this section, we will discuss **Fine-Tuning**.

We can say that fine-tuning means **molding a base model according to your specific requirements**.

---

# Base Model

There are several base models that we know, such as:

- GPT models
- Gemini models
- Llama models
- Mistral models

These models are trained on massive amounts of internet data, books, research papers, code, and many other sources. Because of this, they possess broad knowledge and can perform many different tasks.

However, they always have a **knowledge cutoff**, meaning they only know information up to a certain date.

Why?

Because training these models requires:

- Huge computational resources
- Thousands of GPUs
- Significant time
- Millions of dollars

Therefore, companies cannot retrain them every day. Instead, they periodically train newer versions on more recent data.

---

## Then How Do ChatGPT and Gemini Know Recent Information?

Applications such as ChatGPT and Gemini can often access recent information despite the model's knowledge cutoff.

This is usually achieved through techniques such as:

- Web search
- Retrieval systems (RAG)
- External tools
- Fine-tuned instruction-following behavior

The underlying transformer is still performing **next-token prediction**, but the overall system around it has been engineered to behave like a conversational assistant.

---

# Why Fine-Tune a Model?

Suppose you want to build a chatbot that only specializes in:

- Medicine
- Banking
- Sports
- Music
- Law

A general-purpose model knows a little about everything, but you may want a model that performs exceptionally well in one specific domain.

This is where **fine-tuning** comes in.

Fine-tuning teaches a model:

- How to respond in a specific style
- How to follow specific instructions
- How to behave in a particular domain
- What information should be prioritized

---

# Types of Fine-Tuning

There are two common approaches:

1. Full Parameter Fine-Tuning
2. LoRA Fine-Tuning (Low Rank Adaptation)

---

# Full Parameter Fine-Tuning

In Full Parameter Fine-Tuning, we modify the actual weights of the base model.

The model already contains billions of parameters (weights). During training, these weights are updated so the model behaves according to our requirements.

---

## Example

Suppose we are creating a banking assistant.

Consider the word:

> Bank

The word can mean:

1. A financial institution
2. The side of a river

For a banking application, we want the model to strongly associate "bank" with the financial meaning.

During fine-tuning, the model's weights are adjusted so that it becomes more likely to choose banking-related interpretations in relevant contexts.

---

## How Do Weight Changes Help?

Every transformer contains large neural networks.

You can imagine weights as millions (or billions) of small decision knobs.

When an input arrives:

```
What is a bank?
```

The model predicts the next token based on these weights.

If the model keeps choosing the wrong interpretation, training computes a **loss value**, and through **backpropagation**, the weights are adjusted.

Over many training iterations:

- Wrong predictions become less likely
- Correct predictions become more likely

This process gradually improves the model's behavior.

---

## Training Process

We begin with a dataset.

### Dataset

The dataset usually contains examples such as:

```text
Question: What is a savings account?

Answer: A savings account is a bank account designed to hold money securely while earning interest.
```

The model sees thousands or millions of such examples.

---

### Tokenization

The text is converted into tokens.

Example:

```text
Hello World
```

might become:

```python
[123, 456]
```

(Actual token IDs differ between tokenizers.)

---

### Next Token Prediction

Suppose the complete token sequence is:

```python
[0, 1, 2, 3, 4, 10]
```

We provide:

```python
[0, 1, 2, 3, 4]
```

The model must predict:

```python
10
```

If it predicts:

```python
5
```

or

```python
8
```

it receives a penalty through the loss function.

The loss is then backpropagated to update the weights.

This process repeats over many iterations until the model's predictions improve.

---

## Saving the Model

Once training is complete, the model can be saved and uploaded to platforms such as:

Hugging Face

The model can later be downloaded and used whenever required.

---

## Advantages

- Highest possible adaptation to the domain
- Best accuracy when done correctly
- Full control over model behavior

---

## Disadvantages

- Requires substantial GPU resources
- Expensive to train
- Risk of overfitting
- Incorrect training can damage previously learned capabilities

---

# Chat Templates

A useful concept related to fine-tuning is the **Chat Template**.

Different models expect conversations in different formats.

For example:

### Format 1

```text
<bos>
User: Hello
Assistant: Hi
```

### Format 2

```text
<|user|>
Hello
<|assistant|>
Hi
```

### Format 3

```text
user: Hello
assistant: Hi
```

Remembering every format manually is inconvenient.

To solve this, tokenizers provide:

```python
tokenizer.apply_chat_template()
```

This function automatically converts a standard conversation format into the format expected by the selected model.

---

## Requirement

For this to work, the model must contain a `chat_template`.

Examples:

- Llama Instruct models ✔
- Most modern chat models ✔
- Some older base models ✖

Many chat templates are implemented using **Jinja templates**.

---

# LoRA Fine-Tuning (Low Rank Adaptation)

LoRA takes a different approach.

Instead of modifying the original model weights, LoRA adds a small trainable layer that learns corrections to the base model's behavior.

The original model remains frozen.

---

## Intuition

Imagine the base model says:

```text
2 + 2 = 100
```

The LoRA adapter learns:

```text
Correction = -96
```

Final result:

```text
100 - 96 = 4
```

This example is simplified, but it captures the core idea:

**LoRA learns modifications rather than changing the original model directly.**

---

## Advantages

- Much cheaper to train
- Requires fewer GPUs
- Faster training
- Original model remains untouched
- Easier to share and deploy

---

## Disadvantages

- Usually slightly less powerful than full fine-tuning
- Very domain-specific tasks may benefit more from full parameter tuning

---

# Full Fine-Tuning vs LoRA

| Feature                  | Full Fine-Tuning | LoRA           |
| ------------------------ | ---------------- | -------------- |
| Changes Original Weights | Yes              | No             |
| GPU Requirement          | High             | Low            |
| Training Cost            | Expensive        | Cheap          |
| Risk of Damaging Model   | Higher           | Lower          |
| Storage Size             | Large            | Small          |
| Accuracy Potential       | Highest          | Slightly Lower |

---

# Limitation of Fine-Tuning

Fine-tuning only works on models whose weights are available.

Examples:

- Llama ✔
- Mistral ✔
- Gemma ✔

Proprietary models generally cannot be fine-tuned directly:

- ChatGPT ✖
- Claude ✖
- Gemini ✖

(Although some providers offer their own managed fine-tuning services.)

---

# RAG vs Fine-Tuning

## RAG (Retrieval-Augmented Generation)

Use RAG when:

- Data changes frequently
- Information must stay up-to-date
- New documents are added regularly

Examples:

- Company documents
- Knowledge bases
- News systems
- Internal wikis

The model retrieves information from external sources before generating an answer.

---

## Fine-Tuning

Use Fine-Tuning when:

- Behavior needs to change
- Response style needs customization
- Domain expertise needs improvement
- Data remains relatively stable

Examples:

- Medical assistant
- Legal assistant
- Banking chatbot
- Customer support bot

---

# Quick Rule

### Use RAG when:

> "I need the model to know new information."

### Use Fine-Tuning when:

> "I need the model to behave differently."

In many real-world applications, both techniques are used together:

```text
Fine-Tuning + RAG
```

Fine-tuning teaches the model _how_ to respond, while RAG provides _what_ information to respond with.
