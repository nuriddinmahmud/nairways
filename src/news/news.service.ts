import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { Repository, Not } from 'typeorm';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(@InjectRepository(News) private repo: Repository<News>) {}

  async list(page = 1, limit = 20) {
    const [items, total] = await this.repo.findAndCount({
      order: { publishedAt: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { total, page, limit, items };
  }

  async listAdmin(page = 1, limit = 50) {
    const [items, total] = await this.repo.findAndCount({
      order: { createdAt: 'DESC' },
      withDeleted: true,
      skip: (page - 1) * limit,
      take: limit,
    });
    return { total, page, limit, items };
  }

  async create(authorId: string, dto: CreateNewsDto) {
    const slug = await this.generateUniqueSlug(dto.title);
    const news = this.repo.create({
      ...dto,
      slug,
      author: { id: authorId } as any,
      publishedAt: new Date(),
    });
    return this.repo.save(news);
  }

  async update(id: string, dto: UpdateNewsDto) {
    const news = await this.repo.findOne({ where: { id }, withDeleted: true });
    if (!news) throw new NotFoundException('News not found');

    if (dto.title && dto.title !== news.title) {
      news.title = dto.title;
      news.slug = await this.generateUniqueSlug(dto.title, id);
    }
    if (dto.content !== undefined) news.content = dto.content;
    if (dto.imageUrl !== undefined) news.imageUrl = dto.imageUrl;
    return this.repo.save(news);
  }

  async remove(id: string) {
    const news = await this.repo.findOne({ where: { id }, withDeleted: false });
    if (!news) throw new NotFoundException('News not found');
    await this.repo.softRemove(news);
    return { ok: true };
  }

  async getBySlug(slug: string) {
    const news = await this.repo.findOne({ where: { slug } });
    if (!news) throw new NotFoundException('News not found');
    return news;
  }

  async getById(id: string) {
    const news = await this.repo.findOne({ where: { id }, withDeleted: true });
    if (!news) throw new NotFoundException('News not found');
    return news;
  }

  private async generateUniqueSlug(title: string, currentId?: string) {
    const base = this.slugify(title);
    let candidate = base;
    let counter = 1;
    while (
      await this.repo.exists({
        where: currentId ? { slug: candidate, id: Not(currentId) } : { slug: candidate },
      })
    ) {
      counter += 1;
      candidate = `${base}-${counter}`;
      if (counter > 100) throw new BadRequestException('Unable to generate unique slug');
    }
    return candidate;
  }

  private slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 200) || 'news';
  }
}
