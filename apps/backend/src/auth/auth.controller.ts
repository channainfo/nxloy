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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  AuthResponseDto,
  UserResponseDto,
  MessageResponseDto,
} from './dto/auth-response.dto';
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
@ApiTags('Auth')
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
  @ApiOperation({
    summary: 'Create new user account',
    description: 'Register a new user with email/password. Rate limited to 5 attempts per hour.',
  })
  @ApiResponse({
    status: 201,
    description: 'User account created successfully with access and refresh tokens',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @ApiResponse({ status: 429, description: 'Too many signup attempts' })
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
  @ApiOperation({
    summary: 'Login with email and password',
    description: 'Authenticate user and return JWT tokens. Rate limited to 10 attempts per 15 minutes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns user and tokens',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many login attempts' })
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
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get new access token using refresh token. Implements token rotation for security.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Logout user',
    description: 'Revoke user session and refresh tokens. Requires authentication.',
  })
  @ApiResponse({ status: 204, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user',
    description: 'Get authenticated user information from JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'User data retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
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
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Request a password reset PIN sent via email. Rate limited to 3 attempts per hour.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset PIN sent successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
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
  @ApiOperation({
    summary: 'Reset password with PIN',
    description: 'Reset password using the PIN sent to email.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Invalid or expired PIN' })
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
  @ApiOperation({
    summary: 'Google OAuth login',
    description: 'Initiates Google OAuth flow. Redirects to Google login page.',
  })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth page' })
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
  @ApiOperation({
    summary: 'Google OAuth callback',
    description: 'Handles Google OAuth callback and redirects to frontend with tokens.',
  })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with tokens in URL params' })
  @ApiResponse({ status: 401, description: 'OAuth authentication failed' })
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
  @ApiOperation({
    summary: 'Apple OAuth login',
    description: 'Initiates Apple OAuth flow. Redirects to Apple login page.',
  })
  @ApiResponse({ status: 302, description: 'Redirects to Apple OAuth page' })
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
  @ApiOperation({
    summary: 'Apple OAuth callback',
    description: 'Handles Apple OAuth callback and redirects to frontend with tokens.',
  })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with tokens in URL params' })
  @ApiResponse({ status: 401, description: 'OAuth authentication failed' })
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
  @ApiOperation({
    summary: 'Facebook OAuth login',
    description: 'Initiates Facebook OAuth flow. Redirects to Facebook login page.',
  })
  @ApiResponse({ status: 302, description: 'Redirects to Facebook OAuth page' })
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
  @ApiOperation({
    summary: 'Facebook OAuth callback',
    description: 'Handles Facebook OAuth callback and redirects to frontend with tokens.',
  })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with tokens in URL params' })
  @ApiResponse({ status: 401, description: 'OAuth authentication failed' })
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
