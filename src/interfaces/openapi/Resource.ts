export default interface Resource {
    name: string;
    path: string;
    subResource?: Resource;
};
