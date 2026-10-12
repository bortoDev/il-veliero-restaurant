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

export interface RefreshTokenPayload {
  id: string;
  tokenVersion?: number;
  tokenType: 'refresh';
}

export interface DecodedTokenPayload extends TokenPayload {
  iat?: number;
  exp?: number;
  iss?: string;
  sub?: string;
  tokenType?: string;
}

export class JwtService {
  private readonly secret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;
  private readonly issuer: string = 'il-veliero-api';

  constructor() {
    this.secret = env.jwt.secret;
    this.accessExpiresIn = env.jwt.expiresIn;
    this.refreshExpiresIn = env.jwt.refreshExpiresIn;
  }

  /**
   * Generates a signed access token (default: 15m).
   */
  public generateAccessToken(payload: TokenPayload, expiresIn?: string | number): string {
    const options: SignOptions = {
      expiresIn: (expiresIn || this.accessExpiresIn) as any,
      issuer: this.issuer,
      subject: payload.id,
    };

    return jwt.sign({ ...payload, tokenType: 'access' }, this.secret, options);
  }

  /**
   * Alias for generateAccessToken to ensure backwards compatibility.
   */
  public generateToken(payload: TokenPayload, expiresIn?: string | number): string {
    return this.generateAccessToken(payload, expiresIn);
  }

  /**
   * Generates a signed refresh token (default: 7d).
   */
  public generateRefreshToken(
    payload: { id: string; tokenVersion?: number },
    expiresIn?: string | number
  ): string {
    const options: SignOptions = {
      expiresIn: (expiresIn || this.refreshExpiresIn) as any,
      issuer: this.issuer,
      subject: payload.id,
    };

    const refreshPayload: RefreshTokenPayload = {
      id: payload.id,
      tokenVersion: payload.tokenVersion ?? 0,
      tokenType: 'refresh',
    };

    return jwt.sign(refreshPayload, this.secret, options);
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
   * Verifies specifically a refresh token.
   */
  public verifyRefreshToken(token: string): RefreshTokenPayload {
    const payload = this.verifyToken<RefreshTokenPayload>(token);
    if (payload.tokenType !== 'refresh') {
      throw new Error('Invalid token type: expected refresh token');
    }
    return payload;
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
