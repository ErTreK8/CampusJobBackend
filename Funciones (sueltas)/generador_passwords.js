function generateRandomPassword(length = 10) {
    const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()-_=+';

    const allCharacters = uppercaseLetters + lowercaseLetters + numbers + symbols;

    let password = '';
    // Aseguramos que tenga al menos un carácter de cada tipo
    password += getRandomCharacter(uppercaseLetters);
    password += getRandomCharacter(lowercaseLetters);
    password += getRandomCharacter(numbers);
    password += getRandomCharacter(symbols);

    // Rellenamos el resto con caracteres aleatorios
    while (password.length < length) {
        password += getRandomCharacter(allCharacters);
    }

    // Mezclamos los caracteres para mayor aleatoriedad
    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    return password;
}

// Función auxiliar para obtener un carácter aleatorio
function getRandomCharacter(characters) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
}

// Prueba: genera y muestra varias contraseñas
console.log('Contraseña 1:', generateRandomPassword());
console.log('Contraseña 2:', generateRandomPassword());
console.log('Contraseña 3:', generateRandomPassword(12)); // Contraseña de 12 caracteres