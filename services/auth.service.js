export const SignOut = async () => {
    try {
        
        return {
            status: 200,
            success: true,
            data: {
            },
        }
    } catch (error) {
        const handled = await ErrorHandle(error, 'GetOrderManagerDashboard');
        return handled || { status: 500, success: false, error: 'Internal Server Error' };
    }
}