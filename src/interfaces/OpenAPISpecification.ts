export default interface OpenAPISpecification {
	openapi: string,
	info: InfoObject,
	servers?: ServerObject[],
	paths: PathsObject,
	components?: ComponentsObject,
	security?: SecurityRequirementObject,
	tags?: TagObject[],
	externalDocs?: ExternalDocumentationObject,
}

interface InfoObject {
	title: string,
	description?: string,
	termsOfService?: string,
	contact?: ContactObject,
	license?: LicenseObject,
	version: string,
}

interface ContactObject {
	name?: string,
	url?: string,
	email?: string
}

interface LicenseObject {
	name: string,
	url?: string
}

interface ServerObject {
	url: string,
	description?: string,
	variables?: {
		[key: string]: ServerVariableObject
	}
}

interface ServerVariableObject {
	enum?: string[],
	default: string,
	description: string
}

interface PathsObject {
	[path: string]: PathItemObject
}

interface PathItemObject {
	$ref?: string,
	summary?: string,
	description?: string,
	get?: OperationObject,
	put?: OperationObject,
	post?: OperationObject,
	delete?: OperationObject,
	options?: OperationObject,
	head?: OperationObject,
	patch?: OperationObject,
	trace?: OperationObject,
	servers?: ServerObject[],
	parameters?: ParameterObject[] | ReferenceObject[]
}

interface OperationObject {
	tags?: string[],
	summary?: string,
	description?: string,
	externalDocs?: ExternalDocumentationObject,
	operationId?: string,
	parameters?: ParameterObject[] | ReferenceObject[],
	requestBody?: RequestBodyObject | ReferenceObject,
	responses?: ResponsesObject,
	callbacks?: {
		[key: string]: CallbackObject | ReferenceObject
	},
	deprecated?: boolean,
	security?: SecurityRequirementObject[],
	servers?: ServerObject[]
}

interface ParameterObject {
	name: string,
	in: "path" | "query" | "header" | "cookie",
	description?: string,
	required?: boolean,
	deprecated?: boolean,
	allowEmptyValue?: boolean,
	style?: "matrix" | "label" | "form" | "simple" | "spaceDelimited" | "pipeDelimited" | "deepObject",
	explode?: boolean,
	allowReserved?: boolean,
	schema?: SchemaObject | ReferenceObject,
	example?: any,
	examples?: {
		[key: string]: ExampleObject | ReferenceObject
	},
	content?: {
		[key: string]: MediaTypeObject
	}
}

interface RequestBodyObject {
	description?: string,
	content: {
		[mediaType: string]: MediaTypeObject
	},
	required?: boolean
}

interface MediaTypeObject {
	schema?: SchemaObject | ReferenceObject,
	example?: any,
	examples?: {
		[key: string]: ExampleObject | ReferenceObject
	},
	encoding?: {
		[key: string]: EncodingObject
	}
}

interface EncodingObject {
	contentType?: string,
	headers?: {
		[key: string]: HeaderObject | ReferenceObject
	},
	style?: "matrix" | "label" | "form" | "simple" | "spaceDelimited" | "pipeDelimited" | "deepObject",
	explode?: boolean,
	allowReserved?: boolean
}

interface ResponsesObject {
	default?: ResponseObject | ReferenceObject,
	[httpStatusCode: string]: ResponseObject | ReferenceObject
}

interface ResponseObject {
	description: string,
	headers?: {
		[key: string]: HeaderObject | ReferenceObject
	},
	content?: {
		[key: string]: MediaTypeObject
	},
	links?: {
		[key: string]: LinkObject | ReferenceObject
	}
}

interface CallbackObject {
	[key: string]: PathItemObject
}

interface ExampleObject {
	summary?: string,
	description?: string,
	value?: any,
	externalValue?: string
}

interface LinkObject {
	operationRef?: string,
	operationId?: string,
	parameters?: {
		[key: string]: any
	},
	requestBody?: any
	description?: string,
	server?: ServerObject
}

interface HeaderObject {
	name?: string,
	in?: "path" | "query" | "header" | "cookie",
	description?: string,
	required?: boolean,
	deprecated?: boolean,
	allowEmptyValue?: boolean,
	style?: "matrix" | "label" | "form" | "simple" | "spaceDelimited" | "pipeDelimited" | "deepObject",
	explode?: boolean,
	allowReserved?: boolean,
	schema?: SchemaObject | ReferenceObject,
	example?: any,
	examples?: {
		[key: string]: ExampleObject | ReferenceObject
	},
	content?: {
		[key: string]: MediaTypeObject
	}
}

interface ComponentsObject {
	schemas?: {
		[key: string]: SchemaObject | ReferenceObject
	},
	responses?: {
		[key: string]: ResponseObject | ReferenceObject
	},
	parameters?: {
		[key: string]: ParameterObject | ReferenceObject
	},
	examples?: {
		[key: string]: ExampleObject | ReferenceObject
	},
	requestBodies?: {
		[key: string]: RequestBodyObject | ReferenceObject
	},
	headers?: {
		[key: string]: HeaderObject | ReferenceObject
	},
	securitySchemas?: {
		[key: string]: SecuritySchemeObject | ReferenceObject
	},
	links?: {
		[key: string]: LinkObject | ReferenceObject
	},
	callbacks?: {
		[key: string]: CallbackObject | ReferenceObject
	}
}

interface ReferenceObject {
	$ref: string
}

interface SchemaObject {}

interface SecuritySchemeObject {
	type: string,
	description?: string,
	name: string,
	in: "query" | "header" | "cookie",
	scheme: string,
	bearerFormat?: string,
	flows: OAuthFlowsObject,
	openIdConnectUrl: string
}

interface OAuthFlowsObject {
	implicit?: OAuthFlowObject,
	password?: OAuthFlowObject,
	clientCredentials?: OAuthFlowObject,
	authorizationCode?: OAuthFlowObject
}

interface OAuthFlowObject {
	authorizationUrl: string,
	tokenUrl: string,
	refreshUrl?: string,
	scopes: {
		[key: string]: string
	}
}

interface SecurityRequirementObject {
	[fieldPattern: string]: string[]
}

interface TagObject {
	name: string,
	description?: string,
	externalDocs?: ExternalDocumentationObject
}

interface ExternalDocumentationObject {
	description?: string,
	url: string
}