import * as minimist from 'minimist';
import BenchmarkController from './execution/BenchmarkController';
import { BenchmarkSpecification, OpenAPISpecification } from './interfaces/index';

// Parse arguments passed to node
const argv = minimist(process.argv.slice(2));
if (!argv.spec || !(argv.json || argv.url)) {
    printInstructions();
    process.exit(1);
}

const specification: BenchmarkSpecification = require(argv.spec);
const openAPISpec: string | OpenAPISpecification = argv.json || argv.url;

const benchmarkController = new BenchmarkController(specification, openAPISpec);
benchmarkController.start();

function printInstructions() {
    console.log('Usage: node app.js <options>');
    console.log('<options>:');
    console.log('\t--spec <benchmark_spec.json>\t\tJSON file describing the various parameters of the benchmark run');
    console.log('\t--json <openApi-3.0.json>\tJSON file describing the OpenAPI 3.0 description of the microservice');
    console.log('\t--url <urlToOpenApi>\t\tURL where the OpenAPI 3.0 description of the microservice is located.');
    console.log('\nIn addition to --spec, either --json or --url must be provided.');
}