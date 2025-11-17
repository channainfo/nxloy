import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { RequestPinDto } from './dto/request-pin.dto';
import { VerifyPinDto } from './dto/verify-pin.dto';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Verification Controller
 * Handles PIN verification endpoints
 *
 * Endpoints:
 * - POST /verification/request - Request new PIN
 * - POST /verification/verify - Verify PIN code
 * - GET /verification/verify-token - Verify email link token
 */
@ApiTags('Verification')
@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  /**
   * POST /verification/request
   * Request a new verification PIN
   *
   * @param dto Request details (identifier, type, userId)
   * @returns Success status
   */
  @Public()
  @Post('request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request verification PIN',
    description: 'Request a new verification PIN sent via email or SMS.',
  })
  @ApiResponse({ status: 200, description: 'PIN sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async requestPin(@Body() dto: RequestPinDto) {
    return this.verificationService.requestPin(dto);
  }

  /**
   * POST /verification/verify
   * Verify a PIN code
   *
   * @param dto Verification details (identifier, pin)
   * @returns Success status + token
   */
  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify PIN code',
    description: 'Verify a PIN code sent via email or SMS.',
  })
  @ApiResponse({ status: 200, description: 'PIN verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired PIN' })
  async verifyPin(@Body() dto: VerifyPinDto) {
    return this.verificationService.verifyPin(dto);
  }

  /**
   * GET /verification/verify-token
   * Verify email link token (fallback to PIN)
   *
   * @param token UUID token from email link
   * @returns Success status
   */
  @Public()
  @Get('verify-token')
  @ApiOperation({
    summary: 'Verify email token',
    description: 'Verify email link token (alternative to PIN verification).',
  })
  @ApiQuery({ name: 'token', description: 'UUID token from email link', required: true })
  @ApiResponse({ status: 200, description: 'Token verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyToken(@Query('token') token: string) {
    return this.verificationService.verifyToken(token);
  }
}
