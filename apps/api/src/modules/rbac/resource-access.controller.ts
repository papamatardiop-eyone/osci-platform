import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  ParseEnumPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResourceAccessService } from './resource-access.service';
import { AuthorizationService } from './authorization.service';
import { GrantAccessDto, UpdateAccessDto } from './dto/grant-access.dto';
import { ResourceType, Action } from '../../common/enums';
import { EntityManager } from 'typeorm';

/** Maps ResourceType to the table name and creator column */
const CREATOR_FIELD_MAP: Record<string, { table: string; column: string }> = {
  [ResourceType.Project]: { table: 'security_projects', column: 'createdById' },
  [ResourceType.Object]: { table: 'objects', column: 'createdById' },
  [ResourceType.ObjectGroup]: { table: 'object_groups', column: 'createdById' },
  [ResourceType.Checklist]: { table: 'checklists', column: 'createdById' },
  [ResourceType.Task]: { table: 'tasks', column: 'createdById' },
  [ResourceType.Incident]: { table: 'incidents', column: 'createdById' },
  [ResourceType.Report]: { table: 'reports', column: 'generatedById' },
  [ResourceType.Evidence]: { table: 'evidence', column: 'uploadedById' },
  [ResourceType.CartographyAsset]: { table: 'assets', column: 'createdById' },
  [ResourceType.Integration]: { table: 'integration_configs', column: 'createdById' },
};

@ApiTags('rbac-resource-access')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('resources')
export class ResourceAccessController {
  constructor(
    private readonly resourceAccessService: ResourceAccessService,
    private readonly authorizationService: AuthorizationService,
    private readonly entityManager: EntityManager,
  ) {}

  /**
   * Load the createdById (or equivalent) for a resource.
   */
  private async getCreatorId(
    resourceType: ResourceType,
    resourceId: string,
  ): Promise<string | null> {
    const mapping = CREATOR_FIELD_MAP[resourceType];
    if (!mapping) return null;

    const result = await this.entityManager.query(
      `SELECT "${mapping.column}" FROM "${mapping.table}" WHERE id = $1 LIMIT 1`,
      [resourceId],
    );
    return result?.[0]?.[mapping.column] || null;
  }

  @Get(':resourceType/:resourceId/access')
  async getAccess(
    @Param('resourceType', new ParseEnumPipe(ResourceType)) resourceType: ResourceType,
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @CurrentUser() caller: { userId: string },
  ) {
    const createdById = await this.getCreatorId(resourceType, resourceId);
    const canRead = await this.authorizationService.can(
      caller.userId,
      resourceType,
      resourceId,
      Action.Read,
      createdById,
    );
    if (!canRead) {
      throw new ForbiddenException(
        'You do not have read permission on this resource',
      );
    }
    return this.resourceAccessService.findByResource(resourceType, resourceId);
  }

  @Post(':resourceType/:resourceId/access')
  async grantAccess(
    @Param('resourceType', new ParseEnumPipe(ResourceType)) resourceType: ResourceType,
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @Body() dto: GrantAccessDto,
    @CurrentUser() caller: { userId: string },
  ) {
    const createdById = await this.getCreatorId(resourceType, resourceId);
    return this.resourceAccessService.grantAccess(
      resourceType,
      resourceId,
      dto.userId,
      dto.actions,
      caller.userId,
      createdById,
    );
  }

  @Patch(':resourceType/:resourceId/access/:userId')
  async updateAccess(
    @Param('resourceType', new ParseEnumPipe(ResourceType)) resourceType: ResourceType,
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateAccessDto,
    @CurrentUser() caller: { userId: string },
  ) {
    const createdById = await this.getCreatorId(resourceType, resourceId);
    return this.resourceAccessService.updateAccess(
      resourceType,
      resourceId,
      userId,
      dto.actions,
      caller.userId,
      createdById,
    );
  }

  @Delete(':resourceType/:resourceId/access/:userId')
  async revokeAccess(
    @Param('resourceType', new ParseEnumPipe(ResourceType)) resourceType: ResourceType,
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() caller: { userId: string },
  ) {
    const createdById = await this.getCreatorId(resourceType, resourceId);
    return this.resourceAccessService.revokeAccess(
      resourceType,
      resourceId,
      userId,
      caller.userId,
      createdById,
    );
  }
}
