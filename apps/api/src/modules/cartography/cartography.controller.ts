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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PolicyGuard } from '../../common/guards/policy.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CartographyService } from './cartography.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { CreateRelationDto } from './dto/create-relation.dto';
import { UpdateRelationDto } from './dto/update-relation.dto';
import { Asset } from './entities/asset.entity';
import { Relation } from './entities/relation.entity';

@ApiTags('cartography')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PolicyGuard)
@Controller('cartography')
export class CartographyController {
  constructor(private readonly cartographyService: CartographyService) {}

  // Topology
  @Get('topology')
  async getTopologyGraph(@CurrentUser() user: { userId: string }) {
    return this.cartographyService.getTopologyGraph(user.userId);
  }

  @Get('topology/enriched')
  async getEnrichedTopology(@CurrentUser() user: { userId: string }) {
    return this.cartographyService.getEnrichedTopology(user.userId);
  }

  @Get('impact/:assetId')
  async getImpactAnalysis(
    @Param('assetId', ParseUUIDPipe) assetId: string,
  ) {
    return this.cartographyService.getImpactAnalysis(assetId);
  }

  // Assets
  @Get('assets')
  async findAllAssets(@CurrentUser() user: { userId: string }): Promise<Asset[]> {
    return this.cartographyService.findAllAssets(user.userId);
  }

  @Post('assets')
  async createAsset(
    @Body() dto: CreateAssetDto,
    @CurrentUser() user: { userId: string },
  ): Promise<Asset> {
    return this.cartographyService.createAsset(dto, user.userId);
  }

  @Get('assets/:id')
  async findOneAsset(@Param('id', ParseUUIDPipe) id: string): Promise<Asset> {
    return this.cartographyService.findOneAsset(id);
  }

  @Patch('assets/:id')
  async updateAsset(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssetDto,
  ): Promise<Asset> {
    return this.cartographyService.updateAsset(id, dto);
  }

  @Delete('assets/:id')
  async removeAsset(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.cartographyService.removeAsset(id);
  }

  // Relations
  @Get('relations')
  async findAllRelations(@CurrentUser() user: { userId: string }): Promise<Relation[]> {
    return this.cartographyService.findAllRelations(user.userId);
  }

  @Post('relations')
  async createRelation(@Body() dto: CreateRelationDto): Promise<Relation> {
    return this.cartographyService.createRelation(dto);
  }

  @Patch('relations/:id')
  async updateRelation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRelationDto,
  ): Promise<Relation> {
    return this.cartographyService.updateRelation(id, dto);
  }

  @Delete('relations/:id')
  async removeRelation(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.cartographyService.removeRelation(id);
  }
}
