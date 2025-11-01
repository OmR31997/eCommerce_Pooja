import jwt from 'jsonwebtoken';

export const authentication = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Unauthorized: Token not provided',
        });
    }

    const token = authHeader?.split(' ')[1];

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        if (!decode) {
            return res.status(401).json({
                error: 'Invalid or expired token',
            });
        }

        req.user = decode;

        next();

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
        })
    }
}

export const authorization = {
    ADMIN: (req, res, next) => {
        if (req.user?.role === 'admin') {
            return next();
        }

        return res.status(403).json({
            error: 'Access denied: Admin Only Authorized'
        })
    },

    VENDOR: (req, res, next) => {
        if (req.user?.role === 'vendor') {
            return next();
        }

        return res.status(403).json({
            error: 'Access denied: Vendor Only Authorized'
        })
    },

    CUSTOMER: (req, res, next) => {
        if (req.user?.role === 'user') {
            return next();
        }

        return res.status(403).json({
            error: 'Access denied: Customer Only Authorized'
        })
    }
}