import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Local Auth Guard
 * Used for email/password login endpoint
 *
 * Triggers passport-local strategy validation
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
