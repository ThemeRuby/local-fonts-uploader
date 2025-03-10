export function setStorage(key, data) {
	localStorage.setItem(key, typeof data === "string" ? data : JSON.stringify(data));
}

export function getStorage(key, defaultValue = null) {
	const data = localStorage.getItem(key);
	if (data === null) return defaultValue;

	try {
		return JSON.parse(data);
	} catch {
		return data; // Return as string if JSON parsing fails
	}
}

export function deleteStorage(key) {
	localStorage.removeItem(key);
}
