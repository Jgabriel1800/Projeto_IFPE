function toggleScreens(event) {
    event.preventDefault();

    document
        .getElementById('login-screen')
        .classList
        .toggle('hidden');

    document
        .getElementById('recovery-screen')
        .classList
        .toggle('hidden');
}