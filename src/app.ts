import * as minimist from 'minimist';
import BenchmarkController from './execution/BenchmarkController';
import { BenchmarkSpecification } from './interfaces/index';

const argv = minimist(process.argv.slice(2));
if (!argv.spec || !require(argv.spec)) {
    printInstructions();
    process.exit(1);
}

const specification = require(argv.spec);
const benchmarkController = new BenchmarkController(argv.spec as BenchmarkSpecification);
benchmarkController.start();

function printInstructions() {
    console.log('Usage: node app.js <options>');
    console.log('<options>:');
    console.log('\t--spec <benchmark_spec>\t\tJSON file describing the various parameters of the benchmark run');
}
