exports.enconde64 = (str) => {
    let b = new Buffer(str);
    return b.toString('base64');
};

exports.decode64 = (str) => {
    return Buffer.from(str, 'base64').toString('ascii');
};