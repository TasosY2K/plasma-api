exports.validateIp = (ip) => {
    if (typeof(ip) !== 'string') return false;
    if (!ip.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) return false;
    return ip.split('.').filter(octect => octect >= 0 && octect <= 255).length === 4;
}

exports.generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};