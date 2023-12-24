import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { PrismaService } from '../../src/prisma/prisma.service';

@Injectable()
export class BookmarkService {
    constructor(private prisma: PrismaService) { }

    async createBookmark(userId: number, dto: CreateBookmarkDto) {
        const bookmark = await this.prisma.bookmark.create({
            data: {
                userId,
                ...dto
            }
        })
        return bookmark
    }

    getAllBookmarks(userId: number) {
        return this.prisma.bookmark.findMany({
            where: {
                userId
            }
        })
    }

    getBookmarkById(userId: number, bookmarkId: number) {
        return this.prisma.bookmark.findFirst({
            where: {
                id: bookmarkId,
                userId
            }
        })
    }

    async editBookmarkById(userId: number, bookmarkId: number, dto: EditBookmarkDto) {
        // сначала получаем заметку по ID
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarkId
            }
        })

        // проверяем принадлежит ли закладка пользователю
        if (!bookmark || bookmark.userId !== userId) {
            throw new ForbiddenException('Доступ к указанному ресурсу запрещен')
        }

        return this.prisma.bookmark.update({
            where: {
                id: bookmarkId
            },
            data: {
                ...dto
            }
        })
    }

    async deleteBookmarkById(userId: number, bookmarkId: number) {
        // сначала получаем заметку по ID
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarkId
            }
        })

        // проверяем принадлежит ли закладка пользователю
        if (!bookmark || bookmark.userId !== userId) {
            throw new ForbiddenException('Доступ к указанному ресурсу запрещен')
        }

        // удаляем заметку
        await this.prisma.bookmark.delete({
            where: {
                id: bookmarkId
            }
        })
    }
}
