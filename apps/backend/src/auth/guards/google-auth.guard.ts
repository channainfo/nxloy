import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Google Auth Guard
 * Triggers Google OAuth flow
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
