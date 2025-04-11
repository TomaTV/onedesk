/** @type {import('next').NextConfig} */
const nextConfig = {
    devIndicators: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/**',
            },
        ],
    },
    // Configuration du serveur pour les WebSockets
    webpack: (config) => {
        config.externals.push({
            bufferutil: 'bufferutil',
            'utf-8-validate': 'utf-8-validate',
        });
        return config;
    },
    // Support pour le protocole WebSocket
    experimental: {
        serverComponentsExternalPackages: ['bufferutil', 'utf-8-validate'],
    },
};

export default nextConfig;
