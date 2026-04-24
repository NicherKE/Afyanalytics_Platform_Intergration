let currentHandshakeToken = null;

function addLog(message, type = 'info') {
    const logDiv = document.getElementById('log');
    const timestamp = new Date().toLocaleTimeString();
    const logClass = `log-${type}`;
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${logClass}`;
    logEntry.innerHTML = `[${timestamp}] ${message}`;
    logDiv.appendChild(logEntry);
    logDiv.scrollTop = logDiv.scrollHeight;
}

function displayResult(data, isSuccess) {
    const resultContainer = document.getElementById('resultContainer');
    
    if (isSuccess) {
        resultContainer.innerHTML = `
            <div class="result-card result-success">
                <h3>Authentication Successful!</h3>
                <strong>Handshake Token:</strong>
                <div class="token-box">${data.handshake_token}</div>
                <strong>Expiry Time:</strong> ${data.expires_at}<br>
                <strong>Valid For:</strong> ${data.expires_in_seconds} seconds (15 minutes)<br><br>
                <strong>Access Token:</strong>
                <div class="token-box">${data.access_token}</div>
                <strong>Refresh Token:</strong>
                <div class="token-box">${data.refresh_token}</div>
                <strong>Token Expires In:</strong> ${data.token_expires_in} seconds (6 hours)
            </div>
        `;
    } else {
        resultContainer.innerHTML = `
            <div class="result-card result-error">
                <h3>Authentication Failed</h3>
                <strong>Error:</strong> ${data.error}<br>
                <strong>Step:</strong> ${data.step || 'unknown'}
            </div>
        `;
    }
}

async function runHandshake() {
    const btn = document.getElementById('handshakeBtn');
    btn.disabled = true;
    btn.textContent = 'Processing Handshake...';
    
    addLog('--------------------------------------------------');
    addLog('INITIATING HANDSHAKE PROCESS', 'info');
    addLog('--------------------------------------------------');
    
    try {
        const response = await fetch('/handshake');
        const data = await response.json();
        
        addLog('REQUEST 1: POST /initiate-handshake', 'info');
        addLog('   Parameters:', 'info');
        addLog('   {', 'info');
        addLog('     "platform_name": "Test Platform v2",', 'info');
        addLog('     "platform_key": "afya_2d00d74512953c933172ab924f5073fa",', 'info');
        addLog('     "platform_secret": "e0502a5c052842cf19d0305455437b791d201761c88e2ad641680b2d5d356ba8",', 'info');
        addLog('     "callback_url": "https://localhost:5000/callback"', 'info');
        addLog('   }', 'info');
        
        if (data.success) {
            addLog('--------------------------------------------------');
            addLog('REQUEST 2: POST /complete-handshake', 'info');
            addLog('   Parameters:', 'info');
            addLog('   {', 'info');
            addLog(`     "handshake_token": "${data.handshake_token.substring(0, 40)}...",`, 'info');
            addLog('     "platform_key": "afya_2d00d74512953c933172ab924f5073fa"', 'info');
            addLog('   }', 'info');
            
            addLog('--------------------------------------------------');
            addLog('RESPONSE 1 - Initiate Handshake:', 'success');
            addLog('   {', 'success');
            addLog('     "success": true,', 'success');
            addLog('     "message": "Handshake initiated successfully",', 'success');
            addLog(`     "handshake_token": "${data.handshake_token}",`, 'success');
            addLog(`     "expires_at": "${data.expires_at}",`, 'success');
            addLog('     "expires_in_seconds": 900', 'success');
            addLog('     "next_step": "Complete handshake using /api/external/complete-handshake",', 'success');
            addLog('   }', 'success');
            
            addLog('--------------------------------------------------');
            addLog('RESPONSE 2 - Complete Handshake:', 'success');
            addLog('   {', 'success');
            addLog('     "success": true,', 'success');
            addLog('HANDSHAKE COMPLETED SUCCESSFULLY!', 'success');
            addLog(`    "access_token": "${data.access_token.substring(0, 50)}...",`, 'success');
            addLog(`    "refresh_token": "${data.refresh_token.substring(0, 50)}...",`, 'success');
            addLog('    "token_type": "Bearer",', 'success');
            addLog(`    "Token Expires At": ${data.expires_at}`, 'success');
            addLog(`    "expires_in": ${data.token_expires_in}`, 'success');
            addLog(`    "Valid for": ${data.expires_in_seconds} seconds (15 minutes)`, 'success');
            addLog('     "platform_name": "Test Platform v2",', 'success');
            addLog('   }', 'success');
            
        } else {
            addLog('--------------------------------------------------');
            addLog(`ERROR: ${data.error}`, 'error');
            if (data.step) {
                addLog(`Failed at step: ${data.step}`, 'error');
            }
            addLog('--------------------------------------------------');
        }
        
        displayResult(data, data.success);
        
    } catch (error) {
        addLog(`NETWORK ERROR: ${error.message}`, 'error');
        addLog('   Please check:', 'error');
        addLog('   - Internet connection', 'error');
        addLog('   - API endpoint is accessible', 'error');
        addLog('   - Backend server is running', 'error');
        addLog('--------------------------------------------------');
        
        displayResult({ error: error.message, step: 'network error' }, false);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Run Handshake';
    }
}