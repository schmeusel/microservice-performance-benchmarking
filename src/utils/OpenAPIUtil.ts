export function endsPathWithParamInput(path) {
    return path.match(/\${.*}$/);
}
