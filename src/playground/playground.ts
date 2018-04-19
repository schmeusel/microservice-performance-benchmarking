const openAPISpec = require('../../assets/sampleAPI_extended.json');
const abstractPatterns = require('../../assets/sampleAbstractPattern.json');

import OpenAPIService from '../services/OpenAPIService';
import AbstractPatternResolver from '../pattern/AbstractPatternResolver';
import { OpenAPISpecification } from '../interfaces';

OpenAPIService.initialize(openAPISpec, {})
    .then(() => {
        console.log(OpenAPIService.resources);

        const { specification, resources } = OpenAPIService;
        return AbstractPatternResolver.initialize(abstractPatterns, specification, resources, {});
    })
    .then(() => {
        const { patterns } = AbstractPatternResolver;
        console.log(patterns);
    })
    .catch(e => console.log(e));
