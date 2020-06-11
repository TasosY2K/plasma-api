exports.validateIp = (ip) => {
    if (typeof(ip) !== 'string') return false;
    if (!ip.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) return false;
    return ip.split('.').filter(octect => octect >= 0 && octect <= 255).length === 4;
}

exports.generateId = () => {
    return '_' + Math.random().toString(36).substr(2, 9);
};