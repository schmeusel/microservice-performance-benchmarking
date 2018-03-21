import ExecutorInterface, { WorkloadInterface, WorkloadRequestInterface } from "./ExecutorInterface";

class Executor implements ExecutorInterface {
    
    run(workload: WorkloadInterface[]) {
        throw new Error("Method not implemented.");
    }

    private doRequest(request: WorkloadRequestInterface) {
        
    }
}