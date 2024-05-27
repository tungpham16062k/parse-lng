const { withRasterImages, withPlayback, withSVG } = require('@moxy/next-common-files');

module.exports = () => {
    const plugins = [withRasterImages(), withPlayback(), withSVG()];
    return plugins.reduce((acc, next) => next(acc), {
        reactStrictMode: false,
        swcMinify: true,
        output: 'standalone', // use for docker
    });
};
