import { ZodError } from "zod"
import { UserBusiness } from "../../src/business/UserBusiness"
import { LoginSchema } from "../../src/dtos/user/login.dto"
import { HashManagerMock } from "../mocks/HashManagerMock"
import { IdGeneratorMock } from "../mocks/IdGeneratorMock"
import { TokenManagerMock } from "../mocks/TokenManagerMock"
import { UserDatabaseMock } from "../mocks/UserDatabaseMock"
import { NotFoundError } from "../../src/errors/NotFoundError"
import { describe, expect, test } from '@jest/globals';

describe("Testando login", () => {
  const userBusiness = new UserBusiness(
    new UserDatabaseMock(),
    new IdGeneratorMock(),
    new TokenManagerMock(),
    new HashManagerMock()
  )
  test("deve retornar erro caso email não seja string", () => {
    expect.assertions(1)
    try {
      const input = LoginSchema.parse({
        email: 5,
        password: "fulano123"
      })
    } catch (error) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual([
          {
            code: 'invalid_type',
            expected: 'string',
            received: 'number',
            path: ['email'],
            message: 'Expected string, received number'
          }
        ])
      }
    }
  })
  test("deve retornar erro caso email não esteja cadastrado", async () => {
    expect.assertions(2)
    try {
      const input = LoginSchema.parse({
        email: "vieiramyllena@email.com",
        password: "fulano123"
      })

      await userBusiness.login(input)
    } catch (error) {
      if (error instanceof NotFoundError) {
        expect(error.message).toBe("'email' não encontrado")
        expect(error.statusCode).toBe(404)
      }
    }
  })
  test("deve gerar um token ao logar", async () => {
    const input = LoginSchema.parse({
      email: "fulano@email.com",
      password: "fulano123"
    })

    const output = await userBusiness.login(input)

    expect(output).toEqual({
      message: "Login realizado com sucesso",
      token: "token-mock-fulano"
    })
  })

})
