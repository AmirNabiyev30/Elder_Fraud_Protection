import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import os

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover
    OpenAI = None

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'balanced_spam.csv')
TEST_DATA_PATH = os.path.join(BASE_DIR, 'test_dataset.csv')


model = None
vectorizer = None

def train_model():
    global model, vectorizer

    if os.path.exists(DATA_PATH):
        print("Using full dataset")
        path = DATA_PATH
    elif os.path.exists(TEST_DATA_PATH):
        print("Warning: Full dataset not found, using test dataset")
        path = TEST_DATA_PATH
    else:
        print("Warning: No dataset found. AI features disabled.")
        return None, None

    df = pd.read_csv(path)
    
    df = df.dropna(subset=['text', 'label'])

    X = df['text']
    y = df['label']

    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Vectorize the text using TF-IDF
    vectorizer = TfidfVectorizer(stop_words='english', max_features=10000)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    
    model = LogisticRegression(max_iter=1000)
    model.fit(X_train_vec, y_train)

    # Print accuracy report to console on startup
    y_pred = model.predict(X_test_vec)
    print("Model trained successfully")
    print(classification_report(y_test, y_pred, target_names=['legitimate', 'phishing', 'spam']))

    return model, vectorizer

# Train once when the module is first imported
model, vectorizer = train_model()

LABELS = {
    0: 'legitimate',
    1: 'phishing',
    2: 'spam'
}

FALLBACK_EXPLANATIONS = {
    "legitimate": {
        "summary": "This message appears low risk.",
        "red_flags": [],
        "next_steps": [
            "Still verify unexpected requests through official channels.",
            "Be cautious before sharing personal or financial information.",
        ],
        "explanation": "The classifier did not detect strong scam signals in this message.",
    },
    "phishing": {
        "summary": "This message appears high risk and may be phishing.",
        "red_flags": [
            "It may imitate a trusted sender or service.",
            "It may pressure you to click a link or share account details.",
        ],
        "next_steps": [
            "Do not click links or open attachments in the message.",
            "Contact the organization using its official website or phone number.",
        ],
        "explanation": "The classifier found patterns commonly associated with phishing attempts.",
    },
    "spam": {
        "summary": "This message appears likely to be spam.",
        "red_flags": [
            "It may contain promotional or suspicious mass-sent language.",
            "It may try to push a fast response without context.",
        ],
        "next_steps": [
            "Avoid clicking links unless you trust the sender.",
            "Delete or report the message if it looks suspicious.",
        ],
        "explanation": "The classifier found patterns commonly associated with spam messages.",
    },
}


def _get_fallback_explanation(pred_label):
    return FALLBACK_EXPLANATIONS.get(pred_label, FALLBACK_EXPLANATIONS["spam"]).copy()


def _build_explainer_prompt(text, pred_label, pred_score):
    return f"""
You are helping explain scam analysis results to a non-technical user.

Email text:
\"\"\"{text}\"\"\"

Classifier result:
- Label: {pred_label}
- Confidence score: {pred_score}

Return a short, safety-focused explanation that matches the classifier result.
Do not claim certainty. Avoid legal or forensic language.
""".strip()


def _get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or OpenAI is None:
        return None
    return OpenAI(api_key=api_key)


def _get_ai_explanation(text, pred_label, pred_score):
    client = _get_openai_client()
    if client is None:
        return _get_fallback_explanation(pred_label), False, "OpenAI client not configured"

    schema = {
        "type": "object",
        "properties": {
            "summary": {"type": "string"},
            "red_flags": {
                "type": "array",
                "items": {"type": "string"},
            },
            "next_steps": {
                "type": "array",
                "items": {"type": "string"},
            },
            "explanation": {"type": "string"},
        },
        "required": ["summary", "red_flags", "next_steps", "explanation"],
        "additionalProperties": False,
    }

    response = client.responses.create(
        model="gpt-5-nano",
        input=[
            {
                "role": "system",
                "content": "Explain scam risk clearly and briefly for a non-technical user.",
            },
            {
                "role": "user",
                "content": _build_explainer_prompt(text, pred_label, pred_score),
            },
        ],
        text={
            "format": {
                "type": "json_schema",
                "name": "scam_explanation",
                "strict": True,
                "schema": schema,
            }
        },
    )

    parsed_output = json.loads(response.output_text)
    return parsed_output, True, None


def analyze_text(text):
    if model is None or vectorizer is None:
        return {"error": "Model not available - dataset missing"}

    vectorized_text = vectorizer.transform([text])
    pred_label = model.predict(vectorized_text)[0]
    pred_score = model.predict_proba(vectorized_text)[0][pred_label]
    resolved_label = LABELS[pred_label]
    resolved_score = round(float(pred_score) * 100, 2)

    try:
        explanation, ai_used, ai_error = _get_ai_explanation(text, resolved_label, resolved_score)
    except Exception as exc:
        explanation = _get_fallback_explanation(resolved_label)
        ai_used = False
        ai_error = str(exc)

    return {
        "pred_label": resolved_label,
        "pred_score": resolved_score,
        "summary": explanation["summary"],
        "red_flags": explanation["red_flags"],
        "next_steps": explanation["next_steps"],
        "explanation": explanation["explanation"],
        "ai_used": ai_used,
        "ai_error": ai_error,
    }
