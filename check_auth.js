// Simple test to check if the auth token is valid
function checkAuthToken() {
  console.log("Checking authentication token...");
  
  const token = localStorage.getItem('accessToken');
  console.log("Token exists:", !!token);
  
  if (token) {
    console.log("Token length:", token.length);
    
    // Decode JWT token to check expiration
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log("Token payload:", payload);
        
        if (payload.exp) {
          const expDate = new Date(payload.exp * 1000); // Convert seconds to milliseconds
          const now = new Date();
          console.log("Token expires at:", expDate);
          console.log("Current time:", now);
          console.log("Token expired:", now > expDate);
          
          if (now > expDate) {
            console.log("❌ TOKEN IS EXPIRED - This is likely the cause of the 401 errors");
          } else {
            console.log("✅ Token is still valid");
          }
        }
      }
    } catch (e) {
      console.log("Could not decode token:", e.message);
    }
  } else {
    console.log("❌ NO TOKEN FOUND - User is not logged in");
  }
  
  // Check if user data exists
  const user = localStorage.getItem('currentUser');
  console.log("Current user exists:", !!user);
  if (user) {
    console.log("Current user:", JSON.parse(user));
  }
}

// Run the check
checkAuthToken();