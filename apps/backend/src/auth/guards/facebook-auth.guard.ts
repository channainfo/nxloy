import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Facebook Auth Guard
 * Triggers Facebook OAuth flow
 */
@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {}
