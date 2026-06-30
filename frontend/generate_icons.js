const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcImg = 'C:\\Users\\compu city\\Downloads\\ChatGPT Image Jun 30, 2026, 10_04_10 PM.png';
const destDir = path.join(__dirname, 'public');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const sizes = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'apple-touch-icon.png': 180,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512,
    'logo.png': 512
};

async function generate() {
    try {
        for (const [filename, size] of Object.entries(sizes)) {
            await sharp(srcImg)
                .resize(size, size)
                .toFile(path.join(destDir, filename));
            console.log('Generated ' + filename);
        }
        
        // Browsers often accept a 32x32 PNG renamed as .ico
        fs.copyFileSync(path.join(destDir, 'favicon-32x32.png'), path.join(destDir, 'favicon.ico'));
        console.log('Copied favicon.ico');
    } catch(err) {
        console.error('Error generating images:', err);
    }
}
generate();
