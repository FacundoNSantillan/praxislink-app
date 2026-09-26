import { Controller, Get } from "@nestjs/common";
import { UsersService } from "./users.service";

/**
 * Endpoints sin autenticación, pensados para usarse antes de iniciar sesión
 * (por ejemplo, para que un estudiante elija su universidad de una lista real
 * al registrarse, en vez de escribirla a mano y que después no coincida
 * exactamente con el nombre que usó la universidad).
 */
@Controller("public")
export class PublicController {
  constructor(private usersService: UsersService) {}

  @Get("universities")
  listUniversities() {
    return this.usersService.listUniversitiesBasic();
  }
}
