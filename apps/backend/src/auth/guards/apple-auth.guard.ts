import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Apple Auth Guard
 * Triggers Apple OAuth flow
 */
@Injectable()
export class AppleAuthGuard extends AuthGuard('apple') {}
