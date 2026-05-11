import unittest
from unittest.mock import MagicMock, patch

from backend.app.AI import analyze_text


class AIExplainerTests(unittest.TestCase):
    @patch("backend.app.AI._get_ai_explanation")
    @patch("backend.app.AI.vectorizer")
    @patch("backend.app.AI.model")
    def test_analyze_text_uses_openai_explanation_when_available(
        self,
        model_mock,
        vectorizer_mock,
        get_ai_explanation_mock,
    ):
        vectorizer_mock.transform.return_value = "vectorized"
        model_mock.predict.return_value = [1]
        model_mock.predict_proba.return_value = [[0.1, 0.9, 0.0]]
        get_ai_explanation_mock.return_value = (
            {
                "summary": "High risk phishing attempt.",
                "red_flags": ["Urgent language", "Suspicious request"],
                "next_steps": ["Do not click links", "Verify with the sender directly"],
                "explanation": "The message uses urgency and requests sensitive action.",
            },
            True,
            None,
        )

        result = analyze_text("Please update your password immediately.")

        self.assertEqual(result["pred_label"], "phishing")
        self.assertEqual(result["pred_score"], 90.0)
        self.assertEqual(result["summary"], "High risk phishing attempt.")
        self.assertTrue(result["ai_used"])
        self.assertIsNone(result["ai_error"])

    @patch("backend.app.AI._get_ai_explanation")
    @patch("backend.app.AI.vectorizer")
    @patch("backend.app.AI.model")
    def test_analyze_text_falls_back_when_openai_call_fails(
        self,
        model_mock,
        vectorizer_mock,
        get_ai_explanation_mock,
    ):
        vectorizer_mock.transform.return_value = "vectorized"
        model_mock.predict.return_value = [2]
        model_mock.predict_proba.return_value = [[0.1, 0.1, 0.8]]
        get_ai_explanation_mock.side_effect = Exception("OpenAI timeout")

        result = analyze_text("Exclusive limited time offer.")

        self.assertEqual(result["pred_label"], "spam")
        self.assertEqual(result["pred_score"], 80.0)
        self.assertFalse(result["ai_used"])
        self.assertEqual(result["ai_error"], "OpenAI timeout")
        self.assertIsInstance(result["red_flags"], list)
        self.assertIsInstance(result["next_steps"], list)


if __name__ == "__main__":
    unittest.main()
