module.exports = {
    pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
    reactStrictMode: false,
    experimental: {
        optimizeCss: true,
        swcMinify: true,
    },
    compiler: {
        styledComponents: true,
    },
    headers: async () => {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    }
                ]
            }
        ];
    }
}