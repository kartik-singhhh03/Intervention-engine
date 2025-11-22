/**
 * Sends a webhook notification to a specified URL
 * @param {string} url - The webhook URL to send the payload to
 * @param {Object} payload - The data to send in the webhook
 * @returns {Promise<Object>} Response data or error object
 */
export const sendWebhook = async (url, payload) => {
  // Validate inputs
  if (!url || typeof url !== 'string') {
    console.error('❌ Webhook error: Invalid URL provided');
    return { success: false, error: 'Invalid URL' };
  }

  if (!payload || typeof payload !== 'object') {
    console.error('❌ Webhook error: Invalid payload provided');
    return { success: false, error: 'Invalid payload' };
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    console.log(`📤 Sending webhook to: ${url}`);

    // Build headers with optional BACKEND_SECRET for security
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'SparkWorks-Server/1.0'
    };
    
    // Add BACKEND_SECRET header if configured (for n8n authentication)
    if (process.env.BACKEND_SECRET) {
      headers['x-backend-secret'] = process.env.BACKEND_SECRET;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Check if response was successful
    if (!response.ok) {
      console.error(`❌ Webhook failed: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status
      };
    }

    // Try to parse response as JSON
    let responseData;
    try {
      responseData = await response.json();
    } catch (parseError) {
      // If response is not JSON, get text
      responseData = await response.text();
    }

    console.log(`✅ Webhook sent successfully to: ${url}`);

    return {
      success: true,
      statusCode: response.status,
      data: responseData
    };

  } catch (error) {
    clearTimeout(timeoutId);

    // Handle specific error types
    if (error.name === 'AbortError') {
      console.error(`❌ Webhook timeout after 5 seconds: ${url}`);
      return {
        success: false,
        error: 'Request timeout after 5 seconds'
      };
    }

    if (error.code === 'ECONNREFUSED') {
      console.error(`❌ Webhook connection refused: ${url}`);
      return {
        success: false,
        error: 'Connection refused'
      };
    }

    if (error.code === 'ENOTFOUND') {
      console.error(`❌ Webhook host not found: ${url}`);
      return {
        success: false,
        error: 'Host not found'
      };
    }

    // Generic error
    console.error(`❌ Webhook error: ${error.message}`, {
      url,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sends a webhook notification without waiting for response
 * Fire-and-forget pattern for non-critical notifications
 * @param {string} url - The webhook URL to send the payload to
 * @param {Object} payload - The data to send in the webhook
 */
export const sendWebhookAsync = (url, payload) => {
  // Execute webhook in background, don't wait for result
  sendWebhook(url, payload).catch(error => {
    console.error('❌ Async webhook failed:', error);
  });
};
