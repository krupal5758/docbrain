// All Claude prompt templates. Each returns { system, userMessage }.

export function getSummaryPrompt(text, style = "executive") {
  const styleInstructions = {
    executive: `Write a 3-4 sentence executive brief. Focus on key decisions, outcomes, and implications for a busy professional. Be direct and impactful.`,
    bullets: `Write 5-8 bullet points covering the key takeaways. Each bullet should be 1-2 sentences. Use "-" as the bullet marker.`,
    eli5: `Explain this document like I'm 5 years old. Use simple words, analogies, and avoid all jargon. Keep it under 120 words.`,
    academic: `Write a formal academic summary covering: main thesis/argument, methodology (if applicable), key findings, and implications. Use formal academic tone.`,
  };

  return {
    system: `You are a document analysis expert. Respond ONLY with valid JSON — no markdown, no code fences, just raw JSON.
Schema: {"summary": string, "keyPoints": string[], "wordCount": number}
- summary: the formatted summary text
- keyPoints: 3-5 key topics or themes as short strings
- wordCount: approximate word count of the original document`,
    userMessage: `Summarize this document using the "${style}" style.
Style instruction: ${styleInstructions[style] || styleInstructions.executive}

Document:
${text}`,
  };
}

export function getEntityPrompt(text) {
  return {
    system: `You are a named entity recognition expert. Respond ONLY with valid JSON — no markdown, no code fences.
Schema:
{
  "people": [{"name": string, "context": string}],
  "organizations": [{"name": string, "context": string}],
  "locations": [{"name": string, "context": string}],
  "dates": [{"value": string, "context": string}],
  "keyTerms": [{"term": string, "definition": string}],
  "statistics": [{"value": string, "context": string}]
}
- context/definition: 1 short sentence explaining the entity's role in the document
- Deduplicate entities; pick the most representative instance
- keyTerms: domain-specific concepts or jargon that need explanation`,
    userMessage: `Extract all named entities from this document and categorize them.

Document:
${text}`,
  };
}

export function getQuestionsPrompt(text) {
  return {
    system: `You are an expert educator creating study materials. Respond ONLY with valid JSON — no markdown, no code fences.
Schema:
{
  "factual": [{"question": string, "suggestedAnswer": string}],
  "analytical": [{"question": string, "suggestedAnswer": string}],
  "criticalThinking": [{"question": string, "suggestedAnswer": string}]
}
- factual: 5 questions with direct answers from the text (who/what/when/where)
- analytical: 3 questions requiring reasoning and inference (why/how/compare)
- criticalThinking: 2 questions requiring evaluation or judgment
- suggestedAnswer: 2-4 sentences`,
    userMessage: `Generate study questions from this document at three difficulty levels.

Document:
${text}`,
  };
}

export function getSentimentPrompt(text) {
  return {
    system: `You are a sentiment and tone analysis expert. Respond ONLY with valid JSON — no markdown, no code fences.
Schema:
{
  "overallSentiment": "positive"|"negative"|"neutral"|"mixed",
  "sentimentScore": number,
  "confidence": number,
  "tones": [{"tone": string, "confidence": number}],
  "emotionalBreakdown": {"joy": number, "trust": number, "anticipation": number, "surprise": number, "fear": number, "sadness": number, "anger": number, "disgust": number},
  "readabilityLevel": "elementary"|"middle_school"|"high_school"|"college"|"expert",
  "objectivityScore": number
}
- sentimentScore: -1.0 (very negative) to 1.0 (very positive)
- confidence: 0-100
- tones: 2-5 descriptive tone labels with 0-100 confidence each
- emotionalBreakdown: all values 0-100 (percentage intensity)
- objectivityScore: 0 (opinion) to 100 (factual/objective)`,
    userMessage: `Analyze the sentiment and emotional tone of this document.

Document:
${text}`,
  };
}

export function getConceptMapPrompt(text) {
  return {
    system: `You are a knowledge graph expert. Respond ONLY with valid JSON — no markdown, no code fences.
Schema:
{
  "nodes": [{"id": string, "label": string, "type": "main"|"concept"|"detail"|"entity", "description": string}],
  "edges": [{"source": string, "target": string, "label": string}]
}
Rules:
- 8-15 nodes maximum
- Exactly ONE node with type "main" (the central topic)
- "concept": key ideas directly related to the main topic
- "detail": supporting details or sub-concepts
- "entity": important named entities (people, orgs, places)
- label: 2-4 words
- description: 1-2 sentences
- edge label: relationship type (e.g., "causes", "part of", "leads to", "enables", "opposes")
- source/target: must match node ids exactly`,
    userMessage: `Create a concept map showing the key ideas and their relationships in this document.

Document:
${text}`,
  };
}
