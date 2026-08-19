import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  FEATURE_KEY,
  FeatureName,
  isFeatureEnabled,
} from './feature.decorator';

/**
 * Blocks routes whose feature flag is off. Returns 404 (not 403) so a disabled
 * feature looks like it simply doesn't exist.
 */
@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const feature = this.reflector.getAllAndOverride<FeatureName | undefined>(
      FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!feature) return true;
    if (!isFeatureEnabled(feature)) {
      throw new NotFoundException('Tính năng chưa được bật.');
    }
    return true;
  }
}
