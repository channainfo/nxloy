import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { AppleAuthGuard } from './guards/apple-auth.guard';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';
import { requireEnv } from '../common/utils/env.util';

/**
 * Auth Controller
 * Handles authentication endpoints:
 * - Signup (create account)
 * - Login (get tokens)
 * - Refresh (rotate tokens)
 * - Logout (revoke tokens)
 * - Me (get current user)
 *
 * All routes are public except /me
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/signup
   * Create new user account
   *
   * Rate limit: 5 attempts per hour to prevent spam signups
   *
   * @param signupDto User registration data
   * @returns Created user (without password)
   */
  @Public()
  @Throttle({ default: { ttl: 3600000, limit: 5 } }) // 5 signups per hour
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  /**
   * POST /auth/login
   * Login with email and password
   *
   * Rate limit: 10 attempts per 15 minutes to prevent brute force attacks
   *
   * @param loginDto Login credentials
   * @returns User + access token + refresh token
   */
  @Public()
  @Throttle({ default: { ttl: 900000, limit: 10 } }) // 10 logins per 15 minutes
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * POST /auth/refresh
   * Get new access token using refresh token
   * Implements token rotation for security
   *
   * @param refreshTokenDto Refresh token
   * @returns New access token + new refresh token
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto.refreshToken);
  }

  /**
   * POST /auth/logout
   * Revoke user session and refresh tokens
   *
   * @param user Authenticated user from JWT
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser() user: AuthenticatedUser) {
    await this.authService.logout(user.userId, user.sessionId);
  }

  /**
   * GET /auth/me
   * Get current authenticated user
   * Protected route (requires JWT)
   *
   * @param user Authenticated user from JWT
   * @returns Current user data
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  /**
   * POST /auth/forgot-password
   * Request password reset PIN
   *
   * Rate limit: 3 attempts per hour to prevent account enumeration and spam
   *
   * @param dto Email address
   * @returns Success status
   */
  @Public()
  @Throttle({ default: { ttl: 3600000, limit: 3 } }) // 3 requests per hour
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  /**
   * POST /auth/reset-password
   * Reset password with PIN verification
   *
   * @param dto Email, PIN, new password
   * @returns Success status
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  // ============================================================================
  // OAUTH ENDPOINTS
  // ============================================================================

  /**
   * GET /auth/google
   * Initiates Google OAuth flow
   */
  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Guard redirects to Google
  }

  /**
   * GET /auth/google/callback
   * Google OAuth callback
   */
  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.oauthLogin(req.user);
    this.redirectWithTokens(res, result);
  }

  /**
   * GET /auth/apple
   * Initiates Apple OAuth flow
   */
  @Public()
  @Get('apple')
  @UseGuards(AppleAuthGuard)
  async appleAuth() {
    // Guard redirects to Apple
  }

  /**
   * GET /auth/apple/callback
   * Apple OAuth callback
   */
  @Public()
  @Get('apple/callback')
  @UseGuards(AppleAuthGuard)
  async appleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.oauthLogin(req.user);
    this.redirectWithTokens(res, result);
  }

  /**
   * GET /auth/facebook
   * Initiates Facebook OAuth flow
   */
  @Public()
  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  async facebookAuth() {
    // Guard redirects to Facebook
  }

  /**
   * GET /auth/facebook/callback
   * Facebook OAuth callback
   */
  @Public()
  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.oauthLogin(req.user);
    this.redirectWithTokens(res, result);
  }

  /**
   * Redirect to frontend with OAuth tokens
   * Tokens passed as URL params (frontend stores in localStorage)
   */
  private redirectWithTokens(res: Response, result: any): void {
    const frontendUrl = requireEnv('FRONTEND_URL');
    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
    });

    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  }
}
