import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from '../tasks.service';
import { Task } from '../entities/task.entity';
import { TaskConcerned } from '../entities/task-concerned.entity';
import { ChecklistRunItem } from '../../checklists/entities/checklist-run-item.entity';
import { User } from '../../users/entities/user.entity';
import { TaskStatus, Criticality } from '../../../common/enums';
import { AuthorizationService } from '../../rbac/authorization.service';
import { ResourceAccessService } from '../../rbac/resource-access.service';

type MockRepository = Partial<Record<string, jest.Mock>>;

const createMockRepository = (): MockRepository => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  })),
});

const mockAuthorizationService = {
  getAccessibleResourceIds: jest.fn().mockResolvedValue('all'),
  can: jest.fn().mockResolvedValue(true),
};

const mockResourceAccessService = {
  createCreatorAccess: jest.fn().mockResolvedValue({}),
};

describe('TasksService', () => {
  let service: TasksService;
  let repo: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: createMockRepository() },
        { provide: getRepositoryToken(TaskConcerned), useValue: createMockRepository() },
        { provide: getRepositoryToken(ChecklistRunItem), useValue: createMockRepository() },
        { provide: getRepositoryToken(User), useValue: createMockRepository() },
        { provide: AuthorizationService, useValue: mockAuthorizationService },
        { provide: ResourceAccessService, useValue: mockResourceAccessService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repo = module.get(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ──────────────────────────────────────────
  // findAll
  // ──────────────────────────────────────────
  describe('findAll', () => {
    it('should return all tasks for admin (all accessible)', async () => {
      mockAuthorizationService.getAccessibleResourceIds.mockResolvedValue('all');
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: '1', title: 'T1' }]),
      };
      repo.createQueryBuilder!.mockReturnValue(qb);

      const result = await service.findAll('user-1');
      expect(result.length).toBe(1);
    });

    it('should filter by status', async () => {
      mockAuthorizationService.getAccessibleResourceIds.mockResolvedValue('all');
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      repo.createQueryBuilder!.mockReturnValue(qb);

      await service.findAll('user-1', { status: TaskStatus.InProgress });
      expect(qb.andWhere).toHaveBeenCalledWith('t.status = :status', { status: TaskStatus.InProgress });
    });
  });

  // ──────────────────────────────────────────
  // findOne
  // ──────────────────────────────────────────
  describe('findOne', () => {
    it('should throw NotFoundException when task not found', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────────────────────────────────────
  // create
  // ──────────────────────────────────────────
  describe('create', () => {
    it('should create a task with createdById and call createCreatorAccess', async () => {
      const dto = {
        title: 'New Task',
        objectId: 'obj-1',
        projectId: 'proj-1',
        parentTaskId: 'parent-1',
        labels: ['security', 'urgent'],
        priority: Criticality.High,
      };
      const created = { id: 'new-uuid', ...dto };
      repo.create!.mockReturnValue(created);
      repo.save!.mockResolvedValue(created);

      const result = await service.create(dto, 'creator-user');
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 'proj-1',
          parentTaskId: 'parent-1',
          labels: ['security', 'urgent'],
          createdById: 'creator-user',
        }),
      );
      expect(mockResourceAccessService.createCreatorAccess).toHaveBeenCalledWith(
        'task', 'new-uuid', 'creator-user',
      );
    });
  });

  // ──────────────────────────────────────────
  // update
  // ──────────────────────────────────────────
  describe('update', () => {
    const existing = {
      id: 'uuid-1',
      title: 'Old',
      description: null,
      status: TaskStatus.ToDo,
      priority: Criticality.Medium,
      assignedToId: null,
      leadId: null,
      slaDue: null,
      projectId: null,
      parentTaskId: null,
      labels: null,
    };

    it('should update projectId', async () => {
      repo.findOne!.mockResolvedValue({ ...existing });
      repo.save!.mockImplementation((t) => Promise.resolve(t));

      await service.update('uuid-1', { projectId: 'proj-new' });
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ projectId: 'proj-new' }));
    });

    it('should throw NotFoundException for invalid id', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.update('bad', { title: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────────────────────────────────────
  // remove
  // ──────────────────────────────────────────
  describe('remove', () => {
    it('should remove a task', async () => {
      const task = { id: 'uuid-del', title: 'T' };
      repo.findOne!.mockResolvedValue(task);
      repo.remove!.mockResolvedValue(task);

      await service.remove('uuid-del');
      expect(repo.remove).toHaveBeenCalledWith(task);
    });

    it('should throw NotFoundException for invalid id', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.remove('bad')).rejects.toThrow(NotFoundException);
    });
  });
});
