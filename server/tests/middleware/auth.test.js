const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../../middleware/auth');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token successfully', () => {
      const userId = 123;
      const token = jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'test-secret-key',
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${token}`;

      authenticateToken(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe(userId);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 for missing authorization header', () => {
      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access token required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for malformed authorization header', () => {
      req.headers.authorization = 'InvalidFormat';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access token required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 for invalid token', () => {
      req.headers.authorization = 'Bearer invalid-token';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid or expired token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 for expired token', () => {
      const token = jwt.sign(
        { userId: 123 },
        process.env.JWT_SECRET || 'test-secret-key',
        { expiresIn: '-1h' } // expired token
      );

      req.headers.authorization = `Bearer ${token}`;

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid or expired token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle token with different secret', () => {
      const token = jwt.sign(
        { userId: 123 },
        'different-secret',
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${token}`;

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid or expired token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle Bearer token without space', () => {
      req.headers.authorization = 'Bearertoken123';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access token required'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});