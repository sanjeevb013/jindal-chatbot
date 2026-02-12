const BASE_URL = "https://az-cenind-jspchbt-dev-appservice-phase1-eqdxb0exb7e7hqb6.centralindia-01.azurewebsites.net/api/v1";

export async function authenticateTenant() {
  try {
    const response = await fetch(`${BASE_URL}/authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": "API_KEY1",
      },
      body: JSON.stringify({
        tenant: "string",
      }),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`);
    }

    const data = await response.json();
    localStorage.setItem("authToken", data.token);
    return data.token;
  } catch (error) {
    throw error;
  }
}

export async function startConversation(token, message, conversationId = null) {
  try {
    const body = {
      message: message
    };
    
    if (conversationId) {
      body.conversation_id = conversationId;
    }

    const response = await fetch(`${BASE_URL}/conversation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.detail === "Token expired") {
          throw { status: 401, message: "Token expired" };
        }
      }
      throw new Error(`Conversation API failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export const endConversation = async (token, conversationId) => {
  try {
    if (!token) {
      throw new Error("Auth token is required");
    }

    if (!conversationId) {
      throw new Error("Conversation ID is required");
    }

    const response = await fetch(`${BASE_URL}/conversation/end`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        conversation_id: conversationId,
      }),
    });

    // Handle non-2xx responses
    if (!response.ok) {
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.detail === "Token expired") {
          throw { status: 401, message: "Token expired" };
        }
      }
      let errorMessage = "Failed to end conversation";

      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch {
        // ignore JSON parse error
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    throw error; // rethrow so UI can handle it
  }
};
