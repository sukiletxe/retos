const fs = require('fs');
const path = require('path');

// Función para escanear el directorio y calcular las estadísticas
function scanDir(dirPath, challenges = {}, languages = {}, total = 0, challengeName = null, pathName = null) {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    files.forEach(file => {
        const fullPath = path.join(dirPath, file.name);

        if (file.isDirectory()) {
            // Si es un directorio que contiene un reto
            if (file.name.includes("Reto #") && !challenges[file.name]) {
                challenges[file.name] = 0;
                challengeName = file.name;
            } else if (!file.name.includes("Reto #") && !languages[file.name]) {
                languages[file.name] = 0;
            }

            // Recursivamente escanear subdirectorios
            [challenges, languages, total] = scanDir(fullPath, challenges, languages, total, challengeName, file.name);
        } else {
            // Contar archivos en lenguajes
            if (pathName in languages) {
                total += 1;
                if (challengeName) challenges[challengeName] += 1;
                languages[pathName] += 1;
            }
        }
    });

    return [challenges, languages, total];
}

// Directorio de retos a analizar
const dirPath = path.join(__dirname, 'listado');

// Escanear el directorio y obtener estadísticas
let [challenges, languages, total] = scanDir(dirPath);

// Ordenar retos y lenguajes por uso (de mayor a menor)
challenges = Object.fromEntries(
    Object.entries(challenges).sort(([, a], [, b]) => b - a)
);

languages = Object.fromEntries(
    Object.entries(languages).sort(([, a], [, b]) => b - a)
);

// Construir el contenido de las estadísticas
let statsContent = `\n## Estadísticas de los Retos de Programación\n\n`;
statsContent += `> **${Object.keys(languages).length} LENGUAJES (${total} CORRECCIONES)**\n\n`;

// Agregar retos a las estadísticas
statsContent += `### Retos\n`;
Object.keys(challenges).forEach(challenge => {
    const percentage = ((challenges[challenge] / total) * 100).toFixed(2);
    statsContent += `> ${challenge.toUpperCase()} (${challenges[challenge]}): ${percentage}%\n`;
});

// Agregar lenguajes a las estadísticas
statsContent += `\n### Lenguajes\n`;
statsContent += `- **Lenguajes Utilizados**:\n`;
Object.keys(languages).forEach(language => {
    const percentage = ((languages[language] / total) * 100).toFixed(2);
    statsContent += `  - ${language.toUpperCase()} (${languages[language]}): ${percentage}%\n`;
});

// Escribir el contenido al final del archivo README.md
const readmePath = path.join(__dirname, 'README.md');
fs.appendFileSync(readmePath, statsContent, 'utf8');

console.log('Estadísticas generadas y añadidas a README.md');
