const fs = require('fs-extra');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'ethereal-data', 'data');
const destDir = path.join(__dirname, '..', 'public', 'data');

// Clean destination
fs.removeSync(destDir);
fs.mkdirpSync(destDir);

// Copy files
fs.copySync(sourceDir, destDir);

console.log('Animations copied.');

// todo: verify, minify. static-randomly assign the others
// fs.copySync(
// path.join(__dirname, '..', 'data.json'),
// path.join(__dirname, '..', 'public','data.json'),
// )

function getFilesWithoutExt(dir, ext) {
    return fs.readdirSync(dir)
        .filter(file => file.endsWith(ext))
        .map(file => path.basename(file, ext));
}

function verifyAndAssign() {
    const dataPath = path.join(__dirname, '..', 'data.json');
    const outputPath = path.join(__dirname, '..', 'public', 'data.json');
    const dataFolder = path.join(__dirname, '..','public', 'data');
    const htmlExt = '.html';
    const musicExt = '.mp3';

    const data = JSON.parse(fs.readFileSync(dataPath));
    const animations = data.animations || {};
    const credits = data.credits || {};

    const htmlFiles = getFilesWithoutExt(dataFolder, htmlExt);
    const musicFiles = getFilesWithoutExt(dataFolder, musicExt);


    // Verify existing animations
    for (const anim in animations) {
        if (!htmlFiles.includes(anim)) {
            console.error(`Missing HTML file for animation: ${anim}`);
        }
        const music = animations[anim];
        if (!musicFiles.includes(music)) {
        }

        let hasCredit = false;
        for (const provider in credits) {
            if (credits[provider].some(entry => entry.tracks.includes(music))) {
                hasCredit = true;
                break;
            }
        }
        if (!hasCredit) {
            console.error(`No credit found for music file: ${music}`);
        }
    }

    // Find unassigned animations
    const assignedAnimations = Object.keys(animations);
    const unassignedAnimations = htmlFiles.filter(file => !assignedAnimations.includes(file));

    if (unassignedAnimations.length > 0) {
        console.log(`Found ${unassignedAnimations.length} unassigned animations.`);

        // Collect credited music
        const creditedMusic = [];
        for (const provider in credits) {
            for (const entry of credits[provider]) {
                creditedMusic.push(...entry.tracks);
            }
        }

        if (creditedMusic.length === 0) {
            console.error('No credited music available to assign.');
            return;
        }

        // Sort both lists for deterministic assignment
        unassignedAnimations.sort();
        creditedMusic.sort();

        unassignedAnimations.forEach((anim, index) => {
            const music = creditedMusic[index % creditedMusic.length];
            animations[anim] = music;
        });

        data.animations = animations;
    }

    // Write minified JSON to output path
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(data));
    console.log('written data.json');

}

verifyAndAssign();
