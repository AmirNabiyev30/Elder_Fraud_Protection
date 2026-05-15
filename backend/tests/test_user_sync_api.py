import unittest
from os import environ
from unittest.mock import MagicMock, patch

from backend.app import api
from backend.app import create_app


class UserSyncEndpointTests(unittest.TestCase):
    def setUp(self):
        environ.setdefault("MONGO_URI", "mongodb://localhost:27017/elder_fraud_test")
        self.app = create_app()
        self.client = self.app.test_client()

    def test_sync_requires_authentication(self):
        response = self.client.post("/api/users/sync", json={
            "fullName": "Jane Doe",
            "email": "jane@example.com",
            "phone": "+1 555 123 4567",
        })

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json(), {"error": "Authentication required"})

    def test_protected_dashboard_endpoints_allow_preflight_options(self):
        response = self.client.options(
            "/api/users/me",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "authorization",
            },
        )

        self.assertEqual(response.status_code, 200)

    @patch("backend.app.auth._verify_token")
    def test_sync_requires_email(self, verify_token_mock):
        verify_token_mock.return_value = (
            {"sub": "user_123", "sid": "sess_123", "iss": "issuer_123"},
            None,
        )

        response = self.client.post(
            "/api/users/sync",
            json={"fullName": "Jane Doe"},
            headers={"Authorization": "Bearer valid_token"},
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json(),
            {"error": "email is required"},
        )

    @patch("backend.app.auth._verify_token")
    def test_sync_upserts_user_with_email_only_login_payload(self, verify_token_mock):
        verify_token_mock.return_value = (
            {"sub": "user_123", "sid": "sess_123", "iss": "issuer_123"},
            None,
        )
        users_collection_mock = MagicMock()
        users_collection_mock.find_one.return_value = {
            "clerk_user_id": "user_123",
            "session_id": "sess_123",
            "issuer": "issuer_123",
            "email": "jane@example.com",
        }
        cluster_mock = MagicMock()
        cluster_mock.__getitem__.return_value = {"users": users_collection_mock}

        with patch.object(api.mongo, "cx", cluster_mock):
            response = self.client.post(
                "/api/users/sync",
                json={"email": "jane@example.com"},
                headers={"Authorization": "Bearer valid_token"},
            )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["message"], "User synced successfully")
        self.assertEqual(data["user"]["email"], "jane@example.com")
        users_collection_mock.update_one.assert_called_once()
        update_args, update_kwargs = users_collection_mock.update_one.call_args
        self.assertEqual(update_args[0], {"clerk_user_id": "user_123"})
        self.assertEqual(update_args[1]["$set"]["email"], "jane@example.com")
        self.assertNotIn("full_name", update_args[1]["$set"])
        self.assertNotIn("phone", update_args[1]["$set"])
        self.assertTrue(update_kwargs["upsert"])

    @patch("backend.app.auth._verify_token")
    def test_sync_upserts_user_when_database_write_succeeds(self, verify_token_mock):
        verify_token_mock.return_value = (
            {"sub": "user_123", "sid": "sess_123", "iss": "issuer_123"},
            None,
        )
        users_collection_mock = MagicMock()
        users_collection_mock.find_one.return_value = {
            "clerk_user_id": "user_123",
            "session_id": "sess_123",
            "issuer": "issuer_123",
            "full_name": "Jane Doe",
            "email": "jane@example.com",
            "phone": "+1 555 123 4567",
        }
        cluster_mock = MagicMock()
        cluster_mock.__getitem__.return_value = {"users": users_collection_mock}

        with patch.object(api.mongo, "cx", cluster_mock):
            response = self.client.post(
                "/api/users/sync",
                json={
                    "fullName": "Jane Doe",
                    "email": "jane@example.com",
                    "phone": "+1 555 123 4567",
                },
                headers={"Authorization": "Bearer valid_token"},
            )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["message"], "User synced successfully")
        self.assertEqual(data["user"]["clerk_user_id"], "user_123")
        self.assertEqual(data["user"]["email"], "jane@example.com")
        users_collection_mock.update_one.assert_called_once()
        users_collection_mock.find_one.assert_called_once()

    @patch("backend.app.auth._verify_token")
    def test_sync_returns_500_when_database_write_fails(self, verify_token_mock):
        verify_token_mock.return_value = (
            {"sub": "user_123", "sid": "sess_123", "iss": "issuer_123"},
            None,
        )
        users_collection_mock = MagicMock()
        users_collection_mock.update_one.side_effect = Exception("update failed")
        cluster_mock = MagicMock()
        cluster_mock.__getitem__.return_value = {"users": users_collection_mock}

        with patch.object(api.mongo, "cx", cluster_mock):
            response = self.client.post(
                "/api/users/sync",
                json={
                    "fullName": "Jane Doe",
                    "email": "jane@example.com",
                    "phone": "+1 555 123 4567",
                },
                headers={"Authorization": "Bearer valid_token"},
            )

        self.assertEqual(response.status_code, 500)
        data = response.get_json()
        self.assertEqual(data["error"], "User sync failed")
        self.assertEqual(data["details"], "update failed")

    @patch("backend.app.auth._verify_token")
    def test_get_current_user_returns_synced_profile(self, verify_token_mock):
        verify_token_mock.return_value = (
            {"sub": "user_123", "sid": "sess_123", "iss": "issuer_123"},
            None,
        )
        users_collection_mock = MagicMock()
        users_collection_mock.find_one.return_value = {
            "clerk_user_id": "user_123",
            "full_name": "Jane Doe",
            "email": "jane@example.com",
            "phone": "+1 555 123 4567",
        }
        cluster_mock = MagicMock()
        cluster_mock.__getitem__.return_value = {"users": users_collection_mock}

        with patch.object(api.mongo, "cx", cluster_mock):
            response = self.client.get(
                "/api/users/me",
                headers={"Authorization": "Bearer valid_token"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json(),
            {"user": users_collection_mock.find_one.return_value},
        )

    @patch("backend.app.auth._verify_token")
    def test_get_recent_scans_returns_user_owned_history_and_stats(self, verify_token_mock):
        verify_token_mock.return_value = (
            {"sub": "user_123", "sid": "sess_123", "iss": "issuer_123"},
            None,
        )
        scan_documents = [
            {
                "clerk_user_id": "user_123",
                "pred_label": "phishing",
                "pred_score": 98.5,
                "summary": "High risk phishing attempt.",
                "timestamp": "2026-05-11T15:00:00",
            },
            {
                "clerk_user_id": "user_123",
                "pred_label": "legitimate",
                "pred_score": 72.0,
                "summary": "Likely safe.",
                "timestamp": "2026-05-10T09:30:00",
            },
        ]
        cursor_mock = MagicMock()
        cursor_mock.sort.return_value = cursor_mock
        cursor_mock.limit.return_value = scan_documents

        scans_collection_mock = MagicMock()
        scans_collection_mock.find.return_value = cursor_mock
        cluster_mock = MagicMock()
        cluster_mock.__getitem__.return_value = {"scans": scans_collection_mock}

        with patch.object(api.mongo, "cx", cluster_mock):
            response = self.client.get(
                "/api/scans/recent?limit=5",
                headers={"Authorization": "Bearer valid_token"},
            )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["scans"], scan_documents)
        self.assertEqual(data["stats"]["total_scans"], 2)
        self.assertEqual(data["stats"]["high_risk_scans"], 1)
        self.assertEqual(data["stats"]["counts_by_label"]["phishing"], 1)
        self.assertEqual(data["stats"]["counts_by_label"]["legitimate"], 1)


if __name__ == "__main__":
    unittest.main()
