import { Test, TestingModule } from '@nestjs/testing';
import { CategoryGateway } from './category.gateway';
import { CategoryService } from './category.service';

describe('CategoryGateway', () => {
  let gateway: CategoryGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryGateway, CategoryService],
    }).compile();

    gateway = module.get<CategoryGateway>(CategoryGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
