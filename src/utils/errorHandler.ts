export const parseApiError = (error: unknown, defaultMessage: string = "An unexpected error occurred."): string => {
    if (!error) return defaultMessage;
    
    const err = error as any;
    
    // Axios error response
    if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === 'string') return data;
        if (data.message) return data.message;
        if (data.error) return data.error;
        return JSON.stringify(data);
    }
    
    // Standard JS error
    if (err instanceof Error) {
        return err.message;
    }
    
    // Fallback
    return typeof error === 'string' ? error : defaultMessage;
};
