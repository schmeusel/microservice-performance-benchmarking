export default interface EnvironmentSettings {
    authorizations?: {
        apiKey?: {};
        http?: {};
    },
    servers?: {
        /**
         * serverUrl should be excluded (false) or included (true). Defaults to using the first server if nothing is specified
         */
        [serverUrl: string]: boolean
    }
};
