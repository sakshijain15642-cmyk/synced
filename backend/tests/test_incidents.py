from datetime import datetime

import pytest


def create_incident(client, headers, team_id, **overrides):
    body = {"title": "Login page returns 500", **overrides}
    return client.post(f"/teams/{team_id}/incidents", json=body, headers=headers)


def test_new_incident_gets_default_status_and_severity(client, alice, team_id):
    response = create_incident(client, alice, team_id)
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "open"
    assert body["severity"] == "medium"
    assert body["team_id"] == team_id


def test_invalid_severity_is_rejected(client, alice, team_id):
    response = create_incident(client, alice, team_id, severity="urgent")
    assert response.status_code == 422


def test_list_is_newest_first_and_paginates(client, alice, team_id):
    for n in range(3):
        create_incident(client, alice, team_id, title=f"Incident {n}")
    url = f"/teams/{team_id}/incidents"

    everything = client.get(url, headers=alice).json()
    assert [i["title"] for i in everything] == ["Incident 2", "Incident 1", "Incident 0"]

    last_page = client.get(url, params={"limit": 2, "offset": 2}, headers=alice).json()
    assert [i["title"] for i in last_page] == ["Incident 0"]


def test_list_can_filter_by_status(client, alice, team_id):
    first = create_incident(client, alice, team_id, title="A").json()
    create_incident(client, alice, team_id, title="B")
    client.patch(
        f"/teams/{team_id}/incidents/{first['id']}",
        json={"status": "resolved"},
        headers=alice,
    )

    resolved = client.get(
        f"/teams/{team_id}/incidents", params={"status": "resolved"}, headers=alice
    ).json()
    assert [i["title"] for i in resolved] == ["A"]


def test_requests_without_a_token_are_rejected(client, team_id):
    assert client.get(f"/teams/{team_id}/incidents").status_code == 401


def test_non_members_get_404_on_every_incident_route(client, alice, bob, team_id):
    incident_id = create_incident(client, alice, team_id).json()["id"]
    base = f"/teams/{team_id}/incidents"

    assert client.get(base, headers=bob).status_code == 404
    assert client.post(base, json={"title": "x"}, headers=bob).status_code == 404
    assert client.get(f"{base}/{incident_id}", headers=bob).status_code == 404
    patch = client.patch(f"{base}/{incident_id}", json={"status": "resolved"}, headers=bob)
    assert patch.status_code == 404


def test_incident_is_not_reachable_through_another_teams_url(client, alice, team_id):
    """The IDOR check: Alice is in both teams, but the incident belongs to only one."""
    second_team = client.post("/teams", json={"name": "Second"}, headers=alice).json()["id"]
    incident_id = create_incident(client, alice, team_id).json()["id"]

    response = client.get(f"/teams/{second_team}/incidents/{incident_id}", headers=alice)
    assert response.status_code == 404


def test_patch_changes_only_the_fields_that_were_sent(client, alice, team_id):
    created = create_incident(
        client, alice, team_id, description="Original", severity="low"
    ).json()

    response = client.patch(
        f"/teams/{team_id}/incidents/{created['id']}",
        json={"status": "investigating"},
        headers=alice,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "investigating"
    assert body["description"] == "Original"
    assert body["severity"] == "low"
    assert datetime.fromisoformat(body["updated_at"]) > datetime.fromisoformat(
        created["updated_at"]
    )


@pytest.mark.parametrize(
    "body, expected_status",
    [
        ({}, 400),  # nothing to update
        ({"title": None}, 422),  # explicit null
        ({"status": "fixed"}, 422),  # not an allowed status
    ],
)
def test_patch_rejects_bad_input(client, alice, team_id, body, expected_status):
    incident_id = create_incident(client, alice, team_id).json()["id"]
    response = client.patch(
        f"/teams/{team_id}/incidents/{incident_id}", json=body, headers=alice
    )
    assert response.status_code == expected_status