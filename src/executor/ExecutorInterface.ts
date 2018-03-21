export interface WorkloadRequestInterface {

}
export interface WorkloadInterface {
    request: WorkloadRequestInterface,
    interval: Number
}

export default interface ExecutorInterface {

    run(workload: WorkloadInterface[])
}