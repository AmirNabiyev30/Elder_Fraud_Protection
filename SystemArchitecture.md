# Elder Fraud Protection Architecture

This document describes the overall architecture of the Elder Fraud Protection Application. 

## High Level Component Diagram

```mermaid
flowchart LR
    WC["Web Client<br/>(Chrome Extension)"] -->|"HTTPS + JSON"| WS["Web Server<br/>(planned: Node/Express or Nginx)"]
    WS -->|"HTTP + JSON"| AS["App Server<br/>(Flask API)"]
    AS -->|"BSON/JSON via PyMongo"| DB[("MongoDB Atlas")]
```

The Web Client is currently accessed through our Elder Fraud Protection Chrome Extension. We are also thinking of having an additional option of an Elder Fraud Protection website or desktop application. The Chrome Extension calls the Web Server, which we haven't implemented yet but likely will be Node/Express or Nginx. The Web Server then calls the App Server (Flask). The App Server then accesses our database MongoDB Atlas. 

## Relationship Diagram

```mermaid
erDiagram
    USER {
        string _id
        string full_name
        string email
        datetime created_at
    }

    TRUSTED_CONTACT {
        string _id
        string user_id
        string contact_name
        string contact_channel
        datetime created_at
    }

    SCAN_EVENT {
        string _id
        string user_id
        string source_type
        string source_url
        datetime scanned_at
    }

    FRAUD_ANALYSIS {
        string _id
        string scan_event_id
        int risk_score
        string verdict
        datetime analyzed_at
    }

    ALERT {
        string _id
        string analysis_id
        string severity
        string status
        datetime created_at
    }

    USER ||--o{ TRUSTED_CONTACT : has
    USER ||--o{ SCAN_EVENT : triggers
    SCAN_EVENT ||--|| FRAUD_ANALYSIS : produces
    FRAUD_ANALYSIS ||--o{ ALERT : creates
```

The design shows each USER is the central record connected to both behavior and safety context: a user can have many TRUSTED_CONTACT entries and can trigger many SCAN_EVENT records as messages, emails, or pages are analyzed. Every scan event produces exactly one FRAUD_ANALYSIS document containing outputs such as risk score, verdict, and analysis timestamp, which makes each analysis traceable back to the original scan. From there, one analysis can generate multiple ALERT documents (for example, different severity levels or follow up states), allowing the system to track and manage warning outcomes over time. 

## Flow Diagram

```mermaid
sequenceDiagram
    actor U as User
    participant WC as Web Client (Chrome Extension)
    participant WS as Web Server (planned)
    participant AS as App Server (Flask API)
    participant DB as MongoDB Atlas

    U->>WC: Click "Scan"
    WC->>WC: Extract page/email text
    WC->>WS: POST /scan {text, source}
    WS->>AS: POST /api/analyze {text, source}
    AS->>DB: Read trusted contacts and history
    DB-->>AS: User context documents
    AS->>AS: Run fraud scoring logic
    AS->>DB: Save scan_event, fraud_analysis, alerts
    DB-->>AS: Write acknowledged
    AS-->>WS: 200 OK {risk_score, verdict, reasons}
    WS-->>WC: 200 OK {risk_score, verdict, reasons}
    WC-->>U: Show result and warning state
```

This sample sequence call diagram starts at the user. Upon using the chrome extension to scan, the extension extracts page/email text. The chrome extensions sends a post request /scan to our web server (planned). The web server sends a post request /api/analyze to our app server (Flask). The app server then queries to read the users' trusted contacts and history and saves the current scan for future reference. The app server then runs the fraud scoring logic. Upon successful execution of the scoring logic, the app server sends a 200 OK back to the web server, which directs to the chrome extension. Lastly, the risk score is shown to the user through either the chrome extension/website.


