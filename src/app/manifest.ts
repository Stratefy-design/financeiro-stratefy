import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Fynance - Inteligência Financeira',
        short_name: 'Fynance',
        description: 'Gestão Financeira Inteligente by Stratefy',
        start_url: '/',
        display: 'standalone',
        background_color: '#050505',
        theme_color: '#8058FF',
        icons: [
            {
                src: '/icon',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    };
}
