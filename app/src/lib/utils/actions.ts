import { deserialize } from '$app/forms';

export async function postActivityUpdate(id: string, data: Record<string, any>, url: string) {
    console.log('PostUpdate', data);
	const formData = new FormData();
	formData.append('id', id);

	Object.entries(data).forEach(([key, value]) => {
		if (value instanceof FileList) {
			Array.from(value).forEach((file) => formData.append(key, file));
		} else if (typeof value === 'object' && value !== null) {
			formData.append(key, JSON.stringify(value));
		} else if (value !== undefined && value !== null) {
			formData.append(key, String(value));
		}
	});

	const response = await fetch(url, {
		method: 'POST',
		body: formData,
		headers: {
			'x-sveltekit-action': 'true'
		}
	});

	return deserialize(await response.text());
}
