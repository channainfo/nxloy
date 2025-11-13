import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
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
  async verifyToken(@Query('token') token: string) {
    return this.verificationService.verifyToken(token);
  }
}
