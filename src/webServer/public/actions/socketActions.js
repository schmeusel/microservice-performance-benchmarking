export default function handleSocket(data) {
    return {
        type: data.type,
        data: data.data,
    };
}
