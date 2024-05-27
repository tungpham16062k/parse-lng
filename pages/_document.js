import Document, { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';
import { ServerStyleSheets } from '@mui/styles';

export default class MyDocument extends Document {
    static async getInitialProps(ctx) {
        const sheet = new ServerStyleSheets();
        const originalRenderPage = ctx.renderPage;
        try {
            ctx.renderPage = () =>
                originalRenderPage({
                    enhanceApp: (App) => (props) => sheet.collect(<App {...props} />),
                });
            const initialProps = await Document.getInitialProps(ctx);
            return {
                ...initialProps,
                styles: [...React.Children.toArray(initialProps.styles), sheet.getStyleElement()],
            };
        } finally {
            // sheet.seal()
        }
    }
    render() {
        return (
            <Html lang='vi'>
                <Head>
                    <link
                        rel='stylesheet'
                        href='https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700;900&display=swap'
                    />
                    {/* START: favicon */}
                    <link
                        rel='apple-touch-icon'
                        sizes='180x180'
                        href='/static/favicon/apple-touch-icon.png'
                    />
                    <link
                        rel='icon'
                        type='image/png'
                        sizes='32x32'
                        href='/static/favicon/favicon-32x32.png'
                    />
                    <link
                        rel='icon'
                        type='image/png'
                        sizes='16x16'
                        href='/static/favicon/favicon-16x16.png'
                    />
                    <link
                        rel='manifest'
                        href='/static/favicon/site.webmanifest'
                    />
                    <link
                        rel='shortcut icon'
                        href='/static/favicon/favicon.ico'
                    />
                    <link
                        rel='mask-icon'
                        href='/static/favicon/safari-pinned-tab.svg'
                        color='#ff5955'
                    />
                    <meta
                        name='msapplication-TileColor'
                        content='#ff5955'
                    />
                    <meta
                        name='msapplication-TileImage'
                        content='/static/favicon/mstile-144x144.png'
                    />
                    <meta
                        name='msapplication-config'
                        content='/static/favicon/browserconfig.xml'
                    />
                    <meta
                        name='theme-color'
                        content='#ffffff'
                    />
                    {/* END: favicon */}
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
