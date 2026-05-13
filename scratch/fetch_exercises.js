const fs = require('fs');
const https = require('https');

const URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const OUTPUT_FILE = './client/src/data/exercises.json';

https.get(URL, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const exercises = JSON.parse(data);
            // Transform images to absolute URLs
            const transformed = exercises.map(ex => ({
                ...ex,
                gifUrl: ex.images && ex.images.length > 0 
                    ? `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${ex.id}/images/0.jpg`
                    : 'https://via.placeholder.com/400x400.png?text=No+Exercise+Image'
            }));
            
            // Add some high-quality GIF fallbacks for the most common ones
            const commonGifs = {
                'barbell_bench_press': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif',
                'deadlift': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif',
                'barbell_squat': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Squat.gif',
                'seated_cable_row': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Cable-Row.gif',
                'dumbbell_bicep_curl': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif'
            };

            const finalData = transformed.map(ex => {
                const id = ex.id.toLowerCase().replace(/ /g, '_');
                if (commonGifs[id]) {
                    return { ...ex, gifUrl: commonGifs[id] };
                }
                return ex;
            });

            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalData, null, 2));
            console.log(`Successfully stored ${finalData.length} exercises in ${OUTPUT_FILE}`);
        } catch (err) {
            console.error('Error parsing JSON:', err);
        }
    });
}).on('error', (err) => {
    console.error('Error fetching data:', err);
});
