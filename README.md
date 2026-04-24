# Afyanalytics Platform Integration

A simple Flask application that integrates with the Afyanalytics Health Platform using a two-step handshake authentication mechanism with automatic 15-minute token expiry handling.

## Setup Instructions

### Prerequisites
- Python 3.7+
- pip

### Installation

# Clone repository
git clone https://github.com/NicherKE/Afyanalytics_Platform_Intergration.git
cd Afyanalytics_Platform_Intergration

# Install dependencies
pip install -r requirements.txt

# Run application
python app.py


Open `http://localhost:5000` in browser.

## How the Handshake Flow is Implemented

The authentication uses a two-step handshake process:

### Step 1: Initiate Handshake
Backend calls `POST /initiate-handshake` with credentials:
```python
{
  "platform_name": "Test Platform v2",
  "platform_key": "afya_2d00d74512953c933172ab924f5073fa",
  "platform_secret": "e0502a5c052842cf19d0305455437b791d201761c88e2ad641680b2d5d356ba8",
  "callback_url": "https://localhost:5000/callback"
}
```

### Step 2: Complete Handshake
Backend calls `POST /complete-handshake` with handshake_token from Step 1:
```python
{
  "handshake_token": "8VO1ebf3ekvd6zJFcPQG61DhjIdwYEQuA01ea2SLUmFN3EwhUBMUTQfqpvbWrhbn",
  "platform_key": "afya_2d00d74512953c933172ab924f5073fa"
}
```

### Code Implementation
```python
@app.route('/handshake')
def handshake():
    # Step 1
    resp1 = requests.post(f"{BASE_URL}/initiate-handshake", json=CREDENTIALS)
    token = resp1.json()['data']['handshake_token']
    
    # Step 2
    resp2 = requests.post(f"{BASE_URL}/complete-handshake", json={
        "handshake_token": token,
        "platform_key": CREDENTIALS['platform_key']
    })
    
    return jsonify(resp2.json()['data'])
```

## How Expiry is Handled

### 15-Minute Token Expiry
Handshake token expires in **900 seconds (15 minutes)** as per API specifications.

### Expiry Management

| Time | Action |
|------|--------|
| 0 sec | Token created |
| 0-900 sec | Token valid |
| 900+ sec | Token expired |

### Implementation

1. **Immediate completion:** Complete-handshake executes immediately after receiving token (within milliseconds)

2. **Expiry display:** Returns ISO 8601 timestamp:
```json
{
  "expires_at": "2026-01-08T10:15:00+00:00",
  "expires_in_seconds": 900
}
```

3. **Error handling:** API returns error if token expired:
```python
except Exception as e:
    return jsonify({"error": f"Handshake failed: {str(e)}"})
```

### Error Scenarios Handled

- Expired token → API error message
- Invalid credentials → Authentication failure
- Network timeout (10s) → Connection error
- API unreachable → Network error

## File Structure

```
Afyanalytics_Platform_Intergration/
├── app.py
├── requirements.txt
├── templates/
│   └── index.html
└── static/
    ├── styles.css
    └── scripts.js
```

## Dependencies

```
Flask==2.3.3
requests==2.31.0
```

## Usage

1. Run `python app.py`
2. Click "Run Handshake" button
3. View handshake token and expiry time in results
4. Check complete request/response log

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Handshake fails | Verify credentials in app.py |
| Network error | Check internet connection |
| Token expired | Run handshake again |
| Port 5000 busy | Change port in app.py |


