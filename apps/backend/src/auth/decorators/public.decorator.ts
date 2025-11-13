import { SetMetadata } from '@nestjs/common';

/**
 * Public Decorator
 * Marks routes as public (bypasses JWT authentication)
 *
 * Usage:
 * @Public()
 * @Get('public-endpoint')
 * getPublicData() { ... }
 */
export const Public = () => SetMetadata('isPublic', true);
