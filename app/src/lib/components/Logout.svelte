<form method="POST" action="/auth/logout">
  <button type="submit" class="butter logout-button">Cerrar sesión</button>
</form>
<style>
	form {
		display: inline-block;
	}

	.logout-button {
		background-color: var(--color-error);
		color: white;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: var(--f);
	}

	.logout-button:hover {
		background-color: #cc0000;
		transform: translateY(-2px);
		box-shadow: 0 10px 8px rgba(0, 0, 0, 0.25);
	}

	.logout-button:active {
		transform: translateY(0);
		box-shadow: 0 6px 6px rgba(0, 0, 0, 0.2);
	}
</style>