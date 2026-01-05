import { search } from './searcher';

async function run() {
    const apiKey = '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';
    process.env.TAVILY_API_KEY = apiKey;
    
    const query = process.argv[2] || 'metadata schema for legendary artifacts grimoires technical specification';
    console.log(`LIDLESS LEGION SENSING: ${query}`);
    try {
        const results = await search(query);
        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error(`SENSE FAILURE: ${error}`);
        process.exit(1);
    }
}

run();
