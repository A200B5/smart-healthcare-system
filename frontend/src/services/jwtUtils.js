/**
 * Lightweight JWT decoder.
 * Extracts the payload from a JSON Web Token and parses it.
 *
 * @param {string} token - The JWT string.
 * @returns {Object|null} The decoded payload or null if invalid.
 */
export const decodeJwt = (token) => {
    if (!token) return null;
    try {
        const base64Url = token.split(".")[1]; // JWT is composed of 3 parts: header.payload.signature
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Replace - and _ with + and / to make it a valid base64 string
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)) // if the payload contains Arabic characters, this will encode them
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Invalid token format", error);
        return null;
    }
};

/**
 * Checks if a given JWT token is expired.
 * 
 * @param {string} token - The JWT string.
 * @returns {boolean} True if expired or invalid, false otherwise.
 */
export const isTokenExpired = (token) => {
    const decoded = decodeJwt(token);
    if (!decoded || !decoded.exp) return true;

    // exp is in seconds, Date.now() is in milliseconds
    const expirationTime = decoded.exp * 1000;
    return Date.now() >= expirationTime;
};
