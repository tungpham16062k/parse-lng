import { cStyles } from '@styles/theme';

export const styles = ({ palette }) => ({
    wrapper: {
        padding: 24,
        overflow: 'auto',
        maxHeight: '100vh',
        minHeight: '100vh',
        display: 'flex',
        gap: 24,
        alignItems: 'flex-start',
        '&>div': {
            height: 'calc(100vh - 48px)',
            maxHeight: 'calc(100vh - 48px)',
            overflow: 'auto',
        },
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        padding: 24,
        borderSpacing: 'unset',
        borderCollapse: 'collapse',
        border: `1px solid ${palette.primary.main}`,
        '& th, & td': {
            border: `1px solid ${palette.primary.main}`,
        },
    },
    left: {
        maxWidth: 600,
        minWidth: 600,
        gap: 16,
        ...cStyles.flexColumn,
    },
    editor: {
        flex: 1,
    },
    action: {
        display: 'flex',
        gap: 8,
        '& button': {
            borderRadius: '12px !important',
            boxShadow: 'none !important',
            width: 'fit-content !important',
        },
    },
    box: {
        width: '100%',
        gap: 16,
        ...cStyles.flexColumn,
    },
    input: {
        width: '100%',
        '&>div': {
            width: '100%',
        },
    },
    textarea: {
        width: '100%',
        height: 121,
        '&>div': {
            width: '100%',
        },
    },
    table: {
        width: '100%',
        '& table, th, td': {
            border: '1px solid #ccc',
        },
        '& table': {
            tableLayout: 'fixed',
            borderCollapse: 'collapse',
            width: '100%',
        },
        '&  th, td': {
            textAlign: 'left',
            padding: 8,
            '&.col-key': {
                minWidth: 240,
                maxWidth: 240,
            },
        },
        '& tr': {
            width: 'auto',
            '&.header': {
                backgroundColor: '#18a5fd',
            },
            '&:not(.header):hover': {
                backgroundColor: '#ddd',
            },
        },
    },
});
