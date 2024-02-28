# service-sa-stanza-en
Stanza Sentiment Analyzer for the English Language as Molfar Service

Examples of Input and Output JSON-streams:

1)
- Input:
{"text": "The text message with positive tonality."}
- Output:
{"emotion": "positive"}

2)
- Input:
{"text": "The text message with negative tonality."}
- Output:
{"emotion": "negative"}

3)
- Input:
{"text": "The text message with neutral tonality."}
- Output:
{"emotion": "neutral"}
