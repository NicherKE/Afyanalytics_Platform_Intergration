from flask import Flask, render_template, jsonify
import requests
from datetime import datetime

app = Flask(__name__)

# Configuration
BASE_URL = "https://staging.collabmed.net/api/external"
CREDENTIALS = {
    "platform_name": "Test Platform v2",
    "platform_key": "afya_2d00d74512953c933172ab924f5073fa",
    "platform_secret": "e0502a5c052842cf19d0305455437b791d201761c88e2ad641680b2d5d356ba8",
    "callback_url": "https://localhost:5000/callback"
}

@app.route('/')
def index():
    return render_template('index.html', 
                         platform_name=CREDENTIALS['platform_name'],
                         platform_key=CREDENTIALS['platform_key'])

@app.route('/handshake')
def handshake():
   
# Execute the two-step handshake:    
    try:
        # Step 1: Initiate handshake
        response1 = requests.post(
            f"{BASE_URL}/initiate-handshake",
            json=CREDENTIALS,
            timeout=10
        )
        data1 = response1.json()
        
        # Check if initiation was successful
        if not data1.get('success'):
            return jsonify({
                "success": False,
                "error": data1.get('message', 'Handshake initiation failed'),
                "step": "initiate"
            })
        
        # Extract handshake token and expiry
        handshake_token = data1['data']['handshake_token']
        expires_at = data1['data']['expires_at']
        expires_in = data1['data']['expires_in_seconds']
        
        # Step 2: Complete handshake using the token
        response2 = requests.post(
            f"{BASE_URL}/complete-handshake",
            json={
                "handshake_token": handshake_token,
                "platform_key": CREDENTIALS['platform_key']
            },
            timeout=10
        )
        data2 = response2.json()
        
        # Check if completion was successful
        if data2.get('success'):
            return jsonify({
                "success": True,
                "handshake_token": handshake_token,
                "expires_at": expires_at,
                "expires_in_seconds": expires_in,
                "access_token": data2['data']['access_token'],
                "refresh_token": data2['data']['refresh_token'],
                "token_type": data2['data']['token_type'],
                "token_expires_in": data2['data']['expires_in_seconds'],
                "platform_name": data2['data']['platform_name']
            })
        else:
            return jsonify({
                "success": False,
                "error": data2.get('message', 'Handshake completion failed'),
                "step": "complete"
            })
    
    # Error handling for various scenarios
    except requests.exceptions.Timeout:
        return jsonify({
            "success": False,
            "error": "Network timeout - API is not responding",
            "type": "network_error"
        })
    except requests.exceptions.ConnectionError:
        return jsonify({
            "success": False,
            "error": "Connection error - Cannot reach Afyanalytics API",
            "type": "network_error"
        })
    except requests.exceptions.RequestException as e:
        return jsonify({
            "success": False,
            "error": f"API request failed: {str(e)}",
            "type": "api_error"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Unexpected error: {str(e)}",
            "type": "unknown_error"
        })

if __name__ == '__main__':
    app.run(debug=True, port=5000)