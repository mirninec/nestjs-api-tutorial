import { Test } from '@nestjs/testing'
import * as pactum from 'pactum'
import { AppModule } from '../src/app.module'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { PrismaService } from '../src/prisma/prisma.service'
import { AuthDto } from 'src/auth/dto'
import { EditUserDto } from 'src/user/dto'
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto'

describe('App e2e', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    await app.init()
    await app.listen(3333)

    prisma = app.get(PrismaService)
    await prisma.cleanDb()
    pactum.request.setBaseUrl('http://localhost:3333')
  })
  afterAll(() => {
    app.close()
  })

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'cat@cat.com',
      password: '123'
    }
    describe('Регистрация', () => {
      it('Запрет регистрации если поле для email пустое', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password
          })
          .expectStatus(400)
      })
      it('Запрет регистрации если поле для пароля пустое', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email
          })
          .expectStatus(400)
      })
      it('Запрет регистрации если все поля пустые', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400)
      })
      it('Регистрация нового пользователя со всеми корректно заполенными полями', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
      })
    })

    describe('Вход в систему', () => {
      it('Запрет входа в систему если поле для email пустое', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password
          })
          .expectStatus(400)
      })
      it('Запрет входа в систему если поле для пароля пустое', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email
          })
          .expectStatus(400)
      })
      it('Запрет входа в систему если все поля пустые', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400)
      })
      it('Вход в систему зарегистрированного пользователя', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token')
      })
    })
  })

  describe('User', () => {
    describe('Обо мне', () => {
      it('Получение информации о текущем пользователе', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(200)
      })
    })
    describe('Редактирование', () => {
      it('Редактирование текущего пользователя', () => {
        const dto: EditUserDto = {
          firstName: 'Приап',
          email: 'cat-edited@cat.ru'
        }
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .withBody(dto)
          .expectStatus(200)
      })
    })
    describe('Редактирование', () => {
      it('В теле ответа должны быть поля firstName и email', () => {
        const dto: EditUserDto = {
          firstName: 'Приап',
          email: 'cat-edited@cat.ru'
        }
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email)
      })
    })
  })

  describe('Bookmarks', () => {
    describe('Нет закладок', () => {
      it('Получение закладок(пустой массив)', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([])
      })
    })
    describe('Создать заметку', () => {
      const dto: CreateBookmarkDto = {
        title: 'Первая заметка',
        link: 'https://ya.ru'
      }
      it('Новая заметка', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id')
      })
    })
    describe('Просмотреть все заметки', () => {
      it('Получение закладок(1 шт)', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1)
      })
    })
    describe('Просмотреть заметку по ID', () => {
      it('Сущесвует ли заметка с указанным ID', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')
      })
    })
    describe('Редактировать заметку по ID', () => {
      const dto: EditBookmarkDto = {
        description: 'Описание',
        title: 'Я супер заголовок'
      }
      it('Редактирование заметки по ID', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description)
      })
    })
    describe('Удалить заметку по ID', () => {
      it('Удаление заметки по ID', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204)
      })

      it('Указанная по ID заметка не должна существовать', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
      })
    })
  })
})