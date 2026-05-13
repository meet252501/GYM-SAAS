const fs = require('fs');
const path = require('path');

const RAW_FILE = path.join(__dirname, '../client/src/data/exercises_raw.json');
const OUTPUT_FILE = path.join(__dirname, '../client/src/data/exercises.json');

try {
    const data = fs.readFileSync(RAW_FILE, 'utf8');
    const exercises = JSON.parse(data);
    
    const transformed = exercises.map(ex => ({
        ...ex,
        gifUrl: ex.images && ex.images.length > 0 
            ? `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${ex.id}/images/0.jpg`
            : 'https://via.placeholder.com/400x400.png?text=No+Exercise+Image'
    }));
    
    const commonGifs = {
        'barbell_bench_press': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif',
        'deadlift': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif',
        'barbell_squat': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Squat.gif',
        'seated_cable_row': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Cable-Row.gif',
        'dumbbell_bicep_curl': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif'
    };

    const finalData = transformed.map(ex => {
        // Find if this exercise matches one of our common GIFs
        const match = Object.keys(commonGifs).find(key => 
            ex.name.toLowerCase().replace(/ /g, '_').includes(key) || 
            key.includes(ex.name.toLowerCase().replace(/ /g, '_'))
        );
        
        if (match) {
            return { ...ex, gifUrl: commonGifs[match] };
        }
        return ex;
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalData, null, 2));
    console.log(`Successfully stored ${finalData.length} exercises in ${OUTPUT_FILE}`);
} catch (err) {
    console.error('Error processing exercises:', err);
}
