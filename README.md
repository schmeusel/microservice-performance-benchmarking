# microservice-performance-benchmarking

This is a prototype to benchmark the performance of REST-based 
microservices. It requires the microservice's interface to be 
described with the [OpenAPI Specification](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md)
(formerly known as Swagger).

Workloads are automatically generated based on abstract patterns 
that are defined as part of the configuration property within the 
overall [BenchmarkSpecification](https://github.com/schmeusel/microservice-performance-benchmarking/blob/master/src/interfaces/BenchmarkSpecification.ts).
Check out the `examples` directory for exemplary configurations.

#### Prerequisites
- Node.js v8 or above
- yarn 1.6

#### Installation
```yarn install```

#### Test
```yarn test```


#### Build and Start
```yarn start [options]```

Options are as follows:

| Option | Description |
| --- | --- |
| `--spec <benchmark_spec.json>` | JSON file describing the various parameters of the benchmark run |
| `--url <urlToOpenAPISpec>` | URL where the OpenAPI 3.0 description of the microservice is located |
| `--json <openApi-3.0.json>` | JSON file describing the OpenAPI 3.0 description of the microservice |

Exemplary start command:

```yarn start --url https://petstore.swagger.io/v3/swagger.json --spec ./myBenchmarkConfig.json```

__Note__: Before running the various commands, make sure to 
`cd` into the checked out repository first.

After the benchmark run, logs, both for workloads and measurements, can be found 
in the root directory under `logs`.

By default, the web application is served on port `8080`. To change that, adjust the according 
value in the [config](https://github.com/schmeusel/microservice-performance-benchmarking/blob/master/src/config.ts) file. 
