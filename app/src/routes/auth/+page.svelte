<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="page-container">
	<div class="login-wrapper jelly">
		<div class="login-panel honey">
			<h1 class="login-title">PODCO</h1>
			{#if form?.error}
				<div class="error-message">
					{form.error}
				</div>
			{/if}

			<form method="POST" action="?/login" class="login-form">
				<div class="form-group">
					<label for="email">Email</label>
					<input
						type="email"
						id="email"
						name="email"
						class="butter"
						placeholder="tu@email.com"
						value={form?.email ?? ''}
						required
						autocomplete="email"
					/>
				</div>

				<div class="form-group">
					<label for="password">Contraseña</label>
					<input
						type="password"
						id="password"
						name="password"
						class="butter"
						placeholder="••••••••"
						required
						autocomplete="current-password"
					/>
				</div>

				<button type="submit" class="butter login-button">Entrar</button>
			</form>
		</div>
	</div>
</div>

<style>
	.login-wrapper {
		position: fixed;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: var(--b);
	}

	.login-panel {
		width: 100%;
		max-width: 400px;
		display: flex;
		flex-direction: column;
		gap: var(--c);
		padding: var(--a);
	}

	.login-title {
		color: var(--color-title);
		text-align: center;
	}

	.error-message {
		background-color: var(--color-error);
		color: white;
		padding: var(--b);
		border-radius: var(--a);
		text-align: center;
		font-size: 14px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: var(--b);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}

	.form-group label {
		color: var(--color-text);
		font-size: 14px;
		font-weight: 600;
	}

	.form-group input {
		width: 100%;
		font-size: 16px;
	}

	.form-group input:focus {
		outline: 2px solid var(--color-contrast);
		outline-offset: 2px;
	}

	.login-button {
		width: 100%;
		background-color: var(--color-contrast);
		font-weight: bold;
		font-size: 16px;
		cursor: pointer;
		transition: all 0.2s ease;
		justify-content: center;
	}

	.login-button:hover {
		background-color: rgba(0, 0, 105, 0.9);
		color: white;
		transform: translateY(-2px);
		box-shadow: 0 10px 8px rgba(0, 0, 0, 0.25);
	}

	.login-button:active {
		transform: translateY(0);
		box-shadow: 0 6px 6px rgba(0, 0, 0, 0.2);
	}
</style>