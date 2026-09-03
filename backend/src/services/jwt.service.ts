import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { env } from '../config/environment';
import { UserRole } from '../models/User';

export interface TokenPayload {
  id: string;
  email?: string;
  username?: string;
  role: UserRole;
  name: string;
  isMasterAdmin?: boolean;
  tokenVersion?: number;
}

export interface DecodedTokenPayload extends TokenPayload {
  iat?: number;
  exp?: number;
  iss?: string;
  sub?: string;
}

export class JwtService {
  private readonly secret: string;
  private readonly defaultExpiresIn: string;
  private readonly issuer: string = 'il-veliero-api';

  constructor() {
    this.secret = env.jwt.secret;
    this.defaultExpiresIn = env.jwt.expiresIn;
  }

  /**
   * Generates a signed JWT token containing user identity and role.
   */
  public generateToken(payload: TokenPayload, expiresIn?: string | number): string {
    const options: SignOptions = {
      expiresIn: (expiresIn || this.defaultExpiresIn) as any,
      issuer: this.issuer,
      subject: payload.id,
    };

    return jwt.sign(payload, this.secret, options);
  }

  /**
   * Cryptographically verifies token signature, expiration, and issuer.
   * Throws JsonWebTokenError or TokenExpiredError if invalid.
   */
  public verifyToken<T = TokenPayload>(token: string): T {
    const options: VerifyOptions = {
      issuer: this.issuer,
    };

    return jwt.verify(token, this.secret, options) as T;
  }

  /**
   * Decodes token payload without signature verification.
   */
  public decodeToken(token: string): DecodedTokenPayload | null {
    return jwt.decode(token) as DecodedTokenPayload | null;
  }

  /**
   * Calculates the exact Date when the token expires for MongoDB TTL indexing.
   */
  public getTokenExpirationDate(token: string): Date {
    const decoded = this.decodeToken(token);
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    // Fallback if no exp claim: default 7 days from now
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
}

export const jwtService = new JwtService();
export default jwtService;
